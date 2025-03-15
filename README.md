## PerfGame
![banner](https://github.com/adivenxnataly/PerfGame/blob/main/files/perfbannerv1.1.jpg)
PerfGame is a module that implements "**Game Interventions**".

What is **Game Interventions?** <br>
Game Mode interventions are game-specific optimizations set by original equipment manufacturers (OEMs) to improve the performance of games that are no longer being updated by developers.

> [!NOTE]
> it runs using WindowManager backbuffer size and using ANGLE instead of native GLES drivers (if device support).

**WindowManager backbuffer resizing** <br>
The WindowManager backbuffer resize intervention can **reduce a device's GPU load**. It can also reduce battery consumption when a game is paced at a target frame rate.
Enabling resize can result in a reduction of up to 30% of GPU and 10% of overall system power usage. The results can vary based on the device used, environmental conditions, and other factors, such as simultaneous processing.
An unpaced game that is GPU bound is likely to experience higher frame rates during reduced GPU loads.
We strongly recommend that all games are well paced, because uneven frame rates significantly impact how users perceive performance.
<br>
> The interventions are available in Android 12.

**FPS Throttling**<br>
Android FPS throttling is a Game Mode intervention that helps games run at a more stable frame rate in order to reduce battery consumption.
<br>
> The Interventions are available in Android 13.


## How to use?
This module is based on WebUI (KernelSU), but support Magisk with KsuWebUI.
 - after reboot, you just need to enter the KSU/WebUI application, and select the `PerfGame` module and you will enter the game configuration display :
![screenshot](https://github.com/adivenxnataly/PerfGame/blob/main/files/perfgame.jpg)
<br>

**this configurations supports:**
 - **Global Mode**: <br>
   🔴 Performance (default) <br>
   🟢 Balance <br>
   🟠 Saver <br>
 - **Game-Specific Mode**: <br>
   🔵 **Resolution**: 30-100% <br>
   🔵 **FPS**: 30-120 <br>
 > [!NOTE]
 > FPS is only change WindowManager backbuffer not in-game fps setting, customize based on game. <br>


 > I also added icon for resolution used by Games <br>
 > only support `Unity-based` games.

### How for not supported games? 
you can use manual step to adding `packagename` with this instructions. <br>
there are **two different instructions**, for each scenario: <br>

**1. if the module cannot be installed:** <br>
• first, extract `PerfGamevx.x-release.zip` (recommend to extract in empty folder)<br>
• go to the `/webroot` folder <br>
• add the `gamelist.txt` file <br>
• open file and type `packagename` like this: <br>

    com.mobile.legends
    com.miHoYo.GenshinImpact

• save and exit <br>
• select all module files and folders:
  ```
PerfGamev1.1-release.zip
├── /META-INF
├── /webroot/
│       ├── index.html
│       ├── script.js
│       └── gamelist.txt
├─── customize.sh
├─── module.prop
└─── uninstall.sh
```
• compress back to `.zip` format (make sure the folder/file contents are as above) <br>
• done, you can install the module! <br>

**2. if you successfully install the module just use this:** <br>
• open terminal (adb, Termux, etc) with `su` access and type :

     touch gamelist.txt /data/adb/modules/PerfGame/webroot/gamelist.txt
  
• then, type the `packagename` of the games :

    echo "com.mobile.legends" > /data/adb/modules/PerfGame/webroot/gamelist.txt
    
> or for two games or more, you can type `\n`, like this: <br>
> `echo "com.mobile.legends\ncom.miHoYo.GenshinImpact"`


• done! <br>

now you can configure games that are `not supported` by default by this module.

### Requirements
this is module so install using Magisk/KSU app:
 [Download from Release page](https://github.com/adivenxnataly/PerfGame/releases)

  - Android 12 (SDK 31)

### Tested on
- Android 12 - MIUI 13

### Source, etc.
- [Game Interventions](https://developer.android.com/games/optimize/adpf/gamemode/gamemode-interventions)<br>
- [FPS Throttling](https://developer.android.com/games/optimize/adpf/gamemode/fps-throttling)<br>
- [Module WebUI](https://kernelsu.org/guide/module-webui.html)
