## PerfGame
[![Releases](https://img.shields.io/github/v/release/adivenxnataly/PerfGame?color=green&label=Release&logo=github)](https://github.com/adivenxnataly/PerfGame/releases) [![License](https://img.shields.io/github/license/adivenxnataly/PerfGame?color=red&label=License)](https://github.com/adivenxnataly/PerfGame/blob/main/LICENSE)

![banner](https://github.com/adivenxnataly/PerfGame/blob/main/files/perfbannerv1.1.jpg)
PerfGame is a module that implements **Game Interventions**.

<details>
<summary> What is Game Interventions?</summary>
<br>

Game Mode interventions are game-specific optimizations set by original equipment manufacturers (OEMs) to improve the performance of games that are no longer being updated by developers.
<br>
> it runs using WindowManager backbuffer size or using ANGLE instead of native GLES drivers (if device support).

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
<br>

</details>

>[!important]
> This requires at least Android 12 (API 31) and ARM devices.

## How to use?
This module is based on **WebUI** (KernelSU), but support Magisk with [KsuWebUI](https://github.com/5ec1cff/KsuWebUIStandalone).
 - after reboot, you just need to enter the KSU/WebUI application, and select the `PerfGame` module and you will enter the game configuration display :

<img width="50%" src="https://github.com/adivenxnataly/perfgame-main/blob/main/assets/ui/perfgame.jpg"/><img width="50%" src="https://github.com/adivenxnataly/perfgame-main/blob/main/assets/ui/perfgame_bar-overlay.jpg"/>

### PerfGame
#### Main Function
 - **Global Mode**: <br>
   🔴 Performance (default) <br>
   🟢 Balance <br>
   🟠 Saver <br>
> [!warning]
> for now, Global Mode is only implemented for Mediatek devices (I would really appreciate it if anyone would like to contribute to implementing this for other vendors).
 - **Game-Specific Mode**: <br>
   🔵 **Resolution**: 30-100% <br>
   🔵 **FPS**: 30-120 <br>
 > [!note]
 > FPS is only change WindowManager backbuffer not in-game fps setting, customize based on game. <br>


 > I also added icon for resolution used by Games <br>
 > only support `Unity-based` games.

#### Advance Settings
In version [2.0](https://github.com/adivenxnataly/PerfGame/releases/download/2.0-release) I added a multi-function bar for gaming helpers, such as:
- **Edit Packages**: for easier addition/removal of packages.
- **Disabling VSYNC**: this function allows to ensure VSYNC is turned off.
- **Display style**:
  <br>
  > this changes how the screen uses color tones <br>
  > <img width="80%" src="https://github.com/adivenxnataly/perfgame-main/blob/main/assets/2.0/display_style.png"/>
- **Color adjustment**:
  <br>
  > change saturation for visual enhancement <br>
  > <img width="80%" src="https://github.com/adivenxnataly/perfgame-main/blob/main/assets/2.0/color_adjustment.png"/>

### How for not supported games? 
you can use manual step to adding `packagename` with click bar button on right bottom!

> [!note]
> unsupported packages will not display the app icon and resolution icon (which should be configured from my module), note that this doesn't affect their general functionality.
### Source, etc.
- [Game Interventions](https://developer.android.com/games/optimize/adpf/gamemode/gamemode-interventions)<br>
- [FPS Throttling](https://developer.android.com/games/optimize/adpf/gamemode/fps-throttling)<br>
- [Module WebUI](https://kernelsu.org/guide/module-webui.html)
