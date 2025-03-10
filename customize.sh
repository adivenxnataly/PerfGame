[ ! "$MODPATH" ] && MODPATH=${0%/*}

HTML="$MODPATH/webroot/index.html"
WEBUI="$MODPATH/KsuWebUI.apk"

aborting_sdk(){
    ui_print "  Android (SDK) version is not supported!"
    ui_print "  Module not installed!"
    abort "  Aborting process.."
}

ui_print ""
ui_print "  Android version : $(getprop ro.build.version.release)"
ui_print "  Name : $(grep_prop name $MODPATH/module.prop)"
ui_print "  Version : $(grep_prop version $MODPATH/module.prop)"
ui_print "  VersionCode : $(grep_prop versionCode $MODPATH/module.prop)"
SDK=$API
ui_print "  SDK : $SDK (API)"
if [ $SDK == 31 ]; then
    sleep 1
    ui_print "  SDK version is supported. Continuing..."
elif [ $SDK -gt 31 ]; then
    sleep 1
    ui_print "  SDK version is supported. Continuing..."
elif [ $SDK -lt 31 ]; then
    sleep 1
    aborting_sdk
else
    sleep 1
    aborting_sdk
fi

if [ "$(which magisk)" ]; then
    ui_print ""
    ui_print " • Installing KsuWebUI for Magisk user.."
    if ! pm list packages | grep -q io.github.a13e300.ksuwebui; then
        pm install $WEBUI >&2
    fi
    sleep 2
    if ! pm list packages | grep -q io.github.a13e300.ksuwebui; then
        ui_print "   failed, installing KsuWebUI.apk"
        ui_print "   please install manualy after installation!"
    else
        ui_print "   success, KsuWebUI installed!"
        ui_print "   please, grant root access for KsuWebUI!"
    fi
fi

ui_print ""
ui_print " • Find webroot.."; sleep 1
if [ ! -f "$HTML" ]; then
    ui_print "   failed!"
    abort "   aborting.."
else
    ui_print "   success!"
    sleep 1
fi

ui_print ""
ui_print " • Find Game List.."; sleep 1
package=$(pm list packages -3 | grep -E 'com.mobile.legends|com.miHoYo.GenshinImpact|com.HoYoverse.Nap|com.kurogame.wutheringwaves.global|com.tencent.ig|com.HoYoverse.hkrpgoversea|com.garena.game.codm|com.activision.callofduty.warzone|com.levelinfinite.sgameGlobal.midaspay|com.proximabeta.mf.uamo|com.carxtech.sr|com.levelinfinite.hotta.gp|com.kurogame.gplay.punishing.grayraven.en|com.miHoYo.bh3global|com.seasun.snowbreak.google|com.nexon.bluearchive|com.bushiroad.en.bangdreamgbp|com.sega.pjsekai' | sed 's/package://g' | sed 's/^/   /'); sleep 2
ui_print "   List :"
sleep 1
ui_print "$package"
ui_print ""
awk '
    /const gameList = \[/ {
        print $0

        while ("pm list packages -3" | getline package) {
            if (package ~ /com.mobile.legends|com.miHoYo.GenshinImpact|com.HoYoverse.Nap|com.kurogame.wutheringwaves.global|com.tencent.ig|com.HoYoverse.hkrpgoversea|com.garena.game.codm|com.activision.callofduty.warzone|com.levelinfinite.sgameGlobal.midaspay|com.proximabeta.mf.uamo|com.carxtech.sr|com.levelinfinite.hotta.gp|com.kurogame.gplay.punishing.grayraven.en|com.miHoYo.bh3global|com.seasun.snowbreak.google|com.nexon.bluearchive|com.bushiroad.en.bangdreamgbp|com.sega.pjsekai/) {
                split(package, arr, ":")
                print "            \"" arr[2] "\","
            }
        }
        
        next
    }
    
    { print $0 }
' "$HTML" > "$HTML.tmp" && mv "$HTML.tmp" "$HTML"
sleep 2
if [ $? -eq 0 ]; then
    ui_print "   Success, Game List add to $HTML"
    ui_print ""
    sleep 1
else
    ui_print "   Failed add Gamelist to $HTML"
    abort "   aborting..."
    ui_print ""
fi