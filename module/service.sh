#!/system/bin/sh

# Copyright (C) 2025 adivenxnataly <adinata.ch@proton.me>
# License: Apache 2.0

until [ "$(getprop sys.boot_completed)" = "1" ]; do
    sleep 40
done

# create mode logs
[ ! -f /data/adb/modules/PerfGame/mode.conf ] && echo "performance" > /data/adb/modules/PerfGame/mode.conf

# delay 10s to start perfutils daemon
sleep 10
perfutils
