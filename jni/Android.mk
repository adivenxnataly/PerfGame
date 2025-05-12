LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := perfutils
LOCAL_SRC_FILES := src/perfutils.c
LOCAL_CFLAGS := -Wall -Wextra -Werror -O2
LOCAL_LDFLAGS := -Wl,--hash-style=both
LOCAL_LDLIBS := -llog

include $(BUILD_EXECUTABLE)
