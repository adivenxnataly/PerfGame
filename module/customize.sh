#!/system/bin/sh

# Copyright (C) Adinata <adinata.ch@proton.me>
# License: Apache 2.0

[ ! "$MODPATH" ] && MODPATH=${0%/*}

WEBUI="$MODPATH/KsuWebUI.apk"
GAMELIST="$MODPATH/webroot/gamelist.txt"

name=$(grep_prop name $MODPATH/module.prop)
version=$(grep_prop version $MODPATH/module.prop)
versionCode=$(grep_prop versionCode $MODPATH/module.prop)
git_release=$(grep_prop updateJson $MODPATH/module.prop)

android=$(getprop ro.build.version.release)
API=$API
ARCH=$(getprop ro.product.cpu.abi)

function aborting_api() {
    ui_print "  Android (API) version is not supported!"
    abort "  Aborting installation.."
}

function aborting_abi() {
    ui_print "   Unsupported ABI: $ARCH"
    abort "   Aborting installation..."
}

function aborting() {
    ui_print "   Ups, something wrong!"
    abort "   Abroting installation.."
}

function gamelist() {
    if [ ! -f "$GAMELIST" ]; then
        touch "$GAMELIST"
        chmod 644 "$GAMELIST"
    fi
    
    ui_print "   you can adding game manually in WebUI."
    packages=$(pm list packages -3 | awk -F: '
    $2 ~ /com\.mobile\.legends|com\.miHoYo\.GenshinImpact|com\.HoYoverse\.Nap|com\.kurogame\.wutheringwaves\.global|com\.tencent\.ig|com\.HoYoverse\.hkrpgoversea|com\.garena\.game\.codm|com\.activision\.callofduty\.warzone|com\.levelinfinite\.sgameGlobal\.midaspay|com\.proximabeta\.mf\.uamo|com\.carxtech\.sr|com\.levelinfinite\.hotta\.gp|com\.kurogame\.gplay\.punishing\.grayraven\.en|com\.miHoYo\.bh3global|com\.seasun\.snowbreak\.google|com\.nexon\.bluearchive|com\.bushiroad\.en\.bangdreamgbp|com\.sega\.pjsekai|com\.netease\.newspike|com\.sega\.ColorfulStage/ {
        print $2
        }
    ')

    if [ -n "$packages" ]; then
        ui_print "   Found games:"
        for game in $packages; do
            if ! grep -q "^$game$" "$GAMELIST"; then
                echo "$game" >> "$GAMELIST"
                ui_print "   + $game"
            else
                ui_print "   ✓ $game (already exists)"
            fi
        done
    fi
}

ui_print ""
ui_print "  Android: $android"
ui_print "  Name: $name"
ui_print "  Version: $version ($versionCode)"
ui_print "  Release: $git_release"
ui_print "  API: $API"

if [ $API -lt 31 ]; then
    aborting_api
fi

if [ "$(which magisk)" ]; then
    ui_print ""
    ui_print " • Installing KsuWebUI for Magisk user.."
    if ! pm list packages | grep -q io.github.a13e300.ksuwebui; then
        pm install $WEBUI >&2
    fi
    if ! pm list packages | grep -q io.github.a13e300.ksuwebui; then
        ui_print "   failed, installing KsuWebUI.apk"
        ui_print "   please install manualy after installation!"
    else
        ui_print "   success, KsuWebUI installed!"
        ui_print "   please, grant root access for KsuWebUI!"
    fi
fi

ui_print " • Checking ABI version.."
ui_print "   ABI: $ARCH"
case $ARCH in
    arm64-v8a)
        ARCH_TMP="arm64-v8a"
        ;;
    armeabi-v7a)
        ARCH_TMP="armeabi-v7a"
        ;;
    *) 
        aborting_abi
        ;;
esac

libs=$(find $MODPATH/libs/*/perfutils -type f -print -quit)
bin="$MODPATH/system/bin/perfutils"
if [ -f "$libs" ]; then
    ui_print "   supported ABI, adding executable.."
    mkdir -p "$MODPATH/system/bin"
    cp "$MODPATH/libs/$ARCH_TMP/perfutils" "$bin"
    sleep 1
    rm -rf "$MODPATH/libs"
else
    ui_print "   not found libs file.."
    ui_print "   Please, re-download this module!"
    aborting
fi
if [ -f "$bin" ]; then
    ui_print "   success!"
else
    ui_print "   failed!"
    aborting
fi

ui_print ""
ui_print " • Find webroot.."
if [ -d "$MODPATH/webroot" ]; then
    ui_print "   success!"
else
    ui_print "   failed!"
    aborting
fi

ui_print ""
ui_print " • Setup Game List.. "
gamelist

set_perm_recursive "$MODPATH/system/bin" 0 0 0755 0755
set_perm "$GAMELIST" 0 0 0644

setup_icon() {
    cp "$ICOND" "$MODICON"
            
    chmod 664 "$MODICON"
    chown 6101:6101 "$MODICON"
    chcon u:object_r:theme_data_file:s0 "$MODICON"

    if [ ! -f "$MODICON" ]; then
        ui_print "   using different directories.."
        mkdir -p "$MODPATH/data/local/tmp"
        cp "$ICOND" "/data/local/tmp/perfgame.png"
        mkdir /sdcard/.perfgame
        cp "$ICOND" "/sdcard/.perfgame/perfgame.png"
    fi
    
    ui_print "   success!"
    ui_print ""
}

ui_print ""
ui_print " • Checking Icon file.."
if [ -d "$MODPATH/data/system/theme" ]; then
    ICON=$(find "$MODPATH/data/system/theme" -type f -name perfgame.png)
    if [ -f "$ICON" ]; then
        ICOND="$MODPATH/data/system/theme/perfgame.png"
        IDIR="/data/system/theme/perfgame"
        MODICON="$IDIR/perfgame.png"
        if [ ! "$IDIR" ]; then
            mkdir -p "$IDIR"
            setup_icon
            rm -r $ICOND
        else
            setup_icon
            rm -r $ICOND
        fi
    else
        ui_print "   file not found!"
        ui_print ""
    fi
else
    ui_print "   directory not found!"
fi