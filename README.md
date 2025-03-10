## PerfGame
![banner](https://github.com/adivenxnataly/PerfGame/blob/main/files/perfbanner.png)
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
>The interventions are available in Android 12.

**FPS Throttling**<br>
Android FPS throttling is a Game Mode intervention that helps games run at a more stable frame rate in order to reduce battery consumption.
<br>
>The Interventions are available in Android 13.


## How to use?
This module is based on WebUI (KernelSU), but support Magisk with KsuWebUI.
 - after reboot, you just need to enter the KSU/WebUI application, and select the `PerfGame` module and you will enter the game configuration display :
![screenshot](https://github.com/adivenxnataly/PerfGame/blob/main/files/perfgame.jpg)
<br>

**this configurations supports:**
 - **Global Mode**: Performance (default), Balance, Saver
 - **Game-Specific Mode**: Resolution & FPS.
>I also added icon for resolution used by Games (only support `Unity-based` games).

#### Requirements
this is module so install using Magisk/KSU app:
 [Download from Release page](https://github.com/adivenxnataly/PerfGame/releases)

  - Android 12 (SDK 31)

### Tested on
- Android 12 - MIUI 13

### Source, etc.
- [Game Interventions](https://developer.android.com/games/optimize/adpf/gamemode/gamemode-interventions)<br>
- [FPS Throttling](https://developer.android.com/games/optimize/adpf/gamemode/fps-throttling)<br>
- [Module WebUI](https://kernelsu.org/guide/module-webui.html)
