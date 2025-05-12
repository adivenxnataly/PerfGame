// Copyright (C) 2025 adivenxnataly <adinata.ch@proton.me>
// License: Apache 2.0

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <stdbool.h>

#define DIR "/data/adb/modules/PerfGame"
#define BIN "/system/bin/perfgame"
#define CONF DIR "/mode.conf"
#define GAME_LIST DIR "/webroot/gamelist.txt"
#define ICON_PATH "/sdcard/.perfgame/perfgame.png"
#define SLEEP_INTERVAL 6

typedef struct {
    char last_package[256];
    char last_mode[32];
} State;

void execute_command(const char *cmd) {
    system(cmd);
}

void run_perftest_mode(const char *mode) {
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "%s %s", BIN, mode);
    execute_command(cmd);
}

void send_toast(const char *text) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd),
        "am start -a android.intent.action.MAIN "
        "-e toasttext \"%s\" "
        "-n bellavita.toast/.MainActivity >/dev/null 2>&1",
        text);
    execute_command(cmd);
}

void send_notification(const char *title, const char *text) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd),
        "su -lp 2000 -c \"cmd notification post -S bigtext -t '%s' "
        "-i file://%s -I file://%s 'perfgame' '%s'\" >/dev/null 2>&1",
        title, ICON_PATH, ICON_PATH, text);
    execute_command(cmd);
}

bool get_active_package(char *package) {
    FILE *fp;
    char cmd[2048];
    char line[256];
    
    char grep_filter[2048] = "grep -o -e applist.app.add";
    fp = fopen(GAME_LIST, "r");
    if (fp) {
        while (fgets(line, sizeof(line), fp)) {
            line[strcspn(line, " \t\r\n")] = '\0';
            if (strlen(line) > 0) {
                strcat(grep_filter, " -e ");
                strcat(grep_filter, line);
            }
        }
        fclose(fp);
    }
    
    snprintf(cmd, sizeof(cmd), 
        "dumpsys window | grep package | %s | tail -n 1 | awk '{print $NF}'", 
        grep_filter);
    
    fp = popen(cmd, "r");
    if (fp) {
        if (fgets(line, sizeof(line), fp)) {
            line[strcspn(line, "\r\n")] = '\0';
            strcpy(package, line);
            pclose(fp);
            return true;
        }
        pclose(fp);
    }
    
    package[0] = '\0';
    return false;
}

void get_current_mode(char *mode) {
    FILE *fp = fopen(CONF, "r");
    if (fp) {
        if (!fgets(mode, 32, fp)) {
            strcpy(mode, "balance");
        }
        mode[strcspn(mode, "\r\n")] = '\0';
        fclose(fp);
    } else {
        strcpy(mode, "balance");
    }
}

int main() {
    State state = {0};
    char current_package[256];
    char current_mode[32];
    
    while (1) {
        sleep(SLEEP_INTERVAL);
        
        bool app_active = get_active_package(current_package);
        get_current_mode(current_mode);
        
        if (app_active) {
            if (strcmp(current_package, state.last_package) != 0 || 
                strcmp(current_mode, state.last_mode) != 0) {
                
                run_perftest_mode(current_mode);
                
                char toast_msg[256];
                char notify_msg[256];
                
                snprintf(toast_msg, sizeof(toast_msg),
                    "PerfGame: %s mode applied for %s",
                    current_mode, current_package);
                
                snprintf(notify_msg, sizeof(notify_msg),
                    "%s mode applied for %s, open WebUI for more custom.",
                    current_mode, current_package);
                
                send_toast(toast_msg);
                send_notification("PerfGame", notify_msg);
                
                strcpy(state.last_package, current_package);
                strcpy(state.last_mode, current_mode);
            }
        } else {
            if (strcmp(state.last_mode, "balance") != 0) {
                run_perftest_mode("balance");
                
                send_toast("PerfGame: Balance mode applied (default)");
                send_notification("PerfGame", 
                    "Balance mode applied (default), open WebUI for more custom.");
                
                strcpy(state.last_mode, "balance");
                state.last_package[0] = '\0';
            }
        }
    }
    
    return 0;
}
