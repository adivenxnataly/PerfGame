import { exec } from 'kernelsu';
import { toast } from 'kernelsu';

async function fetchGameList() {
    try {
        const response = await fetch('gamelist.txt');
        if (response.ok) {
            const text = await response.text();
            const fileGameList = text.split('\n').filter(line => line.trim() !== "");
            return fileGameList;
        } else {
            toast("Failed to load gamelist.txt");
        }
    } catch (error) {
        return [];
    }
}

function getGameIcon(packageName) {
    const externalWebpUrl = `https://raw.githubusercontent.com/adivenxnataly/PerfGame/main/assets/icons/${packageName}.webp`;
    const externalPngUrl = `https://raw.githubusercontent.com/adivenxnataly/PerfGame/main/assets/icons/${packageName}.png`;

    return [externalWebpUrl,
        externalPngUrl];
}

async function loadAllGameIcons(gameList) {
    const iconPromises = gameList.map(async (packageName) => {
        const localStorageKey = `gameIcon-${packageName}`;
        const cachedIcon = localStorage.getItem(localStorageKey);
        
        if (!cachedIcon) {
            const [externalWebpUrl,
                externalPngUrl] = getGameIcon(packageName);
            try {
                const response = await fetch(externalWebpUrl);
                if (!response.ok) throw new Error(`Failed to load WebP icon: ${response.statusText}`);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onload = function () {
                        const iconDataUrl = reader.result;
                        localStorage.setItem(localStorageKey, iconDataUrl);
                    };
                reader.readAsDataURL(blob);
            } catch (webpError) {
                try {
                    const responsePng = await fetch(externalPngUrl);
                    if (!responsePng.ok) throw new Error(`Failed to load PNG icon: ${responsePng.statusText}`);
                        const blob = await responsePng.blob();
                        const reader = new FileReader();
                        reader.onload = function () {
                            const iconDataUrl = reader.result;
                            localStorage.setItem(localStorageKey, iconDataUrl);
                        };
                    reader.readAsDataURL(blob);
                } catch (pngError) {
                    return;
                }
            }
        }
    });
    
    await Promise.all(iconPromises);
}

document.addEventListener('DOMContentLoaded', async function() {
    const gameListContainer = document.getElementById('game-list');
    const noGamesMessage = document.getElementById('no-games-message');
    const modeIndicator = document.querySelector('.mode-indicator');
    const currentModeButton = document.getElementById('current-mode');
    const modeOptions = document.getElementById('mode-options');
    const performanceOption = document.getElementById('performance-option');
    const balanceOption = document.getElementById('balance-option');
    const batteryOption = document.getElementById('battery-option');
    const helpButton = document.getElementById('help');
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const filterToggle = document.getElementById('filter-toggle');
    const modePopup = document.getElementById('mode-popup');
    const path = '/data/adb/modules/PerfGame';
    
    const gameNameMapping = {
        'com.HoYoverse.Nap': 'Zenless Zone Zero',
        'com.HoYoverse.hkrpgoversea': 'Honkai: Star Rail',
        'com.RINGGAMES.StellaFantasy': 'Stella Fantasy',
        'com.YoStar.AetherGazer': 'Aether Gazer',
        'com.activision.callofduty.warzone': 'COD: Warzone Mobile',
        'com.asia.arrival': 'Earth: Revival',
        'com.asobimo.metria': 'RPG METRIA the Starlight',
        'com.blingame.haaktestb': 'HAAK',
        'com.bushiroad.en.bangdreamgbp': 'BanG Dream!',
        'com.carxtech.sr': 'CarX Street',
        'com.game.BOGX.google': 'Blade of God X: Orisols',
        'com.galileo.r3': 'NANOSPACE',
        'com.gameloft.android.ANMP.GloftA9HM': 'Asphalt Legends Unite',
        'com.garena.game.codm': 'COD: Mobile',
        'com.garena.game.df': 'Garena Delta Force',
        'com.glohow.global.blackbeacon': 'Black Beacon',
        'com.gzptn.Survivors': 'Survivors Of The Zombie World',
        'com.HoYoverse.hkrpgoversea': 'Honkai: Star Rail',
        'com.HoYoverse.Nap': 'Zenless Zone Zero',
        'com.kurogame.gplay.punishing.grayraven.en': 'PGR',
        'com.kurogame.wutheringwaves.global': 'Wuthering Waves',
        'com.levelinfinite.hotta.gp': 'Tower of Fantasy',
        'com.levelinfinite.sgameGlobal.midaspay': 'Honor of Kings',
        'com.majamojo.etechronicle': 'E.T.E Chronicle',
        'com.miHoYo.GenshinImpact': 'Genshin Impact',
        'com.miHoYo.bh3global': 'Honkai Impact 3',
        'com.mobile.legends': 'Mobile Legends: Bang Bang',
        'com.nexon.bluearchive': 'Blue Archive',
        'com.netease.newspike': 'Blood Strike',
        'com.newtypegames.dl2hmt': 'Dinasty Legends 2',
        'com.onefun.gps.zbw': 'Zero-based World',
        'com.overseas.totnew': 'Tales of Terrarum',
        'com.pantheraplay.soulhuntress': 'Soul Huntress: Roguelike',
        'com.pinkcore.heros': 'Rise of Eros: Desire',
        'com.proximabeta.dn2.global': 'Dragon Nest 2: Evolution',
        'com.proximabeta.mf.uamo': 'Arena Breakout',
        'com.seasun.snowbreak.google': 'Snowbreak',
        'com.sega.ColorfulStage.en': 'ColorfulStage',
        'com.sega.pjsekai': 'Project Sekai',
        'com.slash.girl.redfish': 'Slash & Girl',
        'com.tencent.ig': 'PUBG: Mobile',
        'com.tencent.tmgp.nshm': '逆水寒',
        'com.xd.fpos.ad': 'Flash Party',
        'com.xishanju.codess.intl': 'Dawnlands',
        'games.my.zombie.shooter': 'Zombie State: FPS Shooting',
        'se.illusionlabs.tgx': 'Touchgrind BMX 3: Rivals',
        'com.gamez.catfantasy': 'Cat Fantasy: Isekai Adventure'
    };
    
    let isModeOptionsVisible = false;
    let gamesDetected = false;
    let currentMode = localStorage.getItem('selectedMode') || 'Performance';
    let isFirstLoad = true;
    const gameList = await fetchGameList();
    
    function loadGameList() {
        if (gameList.length === 0) {
            noGamesMessage.classList.remove('hidden');
            modeIndicator.classList.remove('bg-red-600', 'bg-green-400', 'bg-orange-400');
            filterToggle.classList.remove('hidden');
            toast("ups, no games detected!")
        } else {
            noGamesMessage.classList.add('hidden');
            currentModeButton.classList.remove('hidden');
            gamesDetected = true;
            modeIndicator.classList.remove('bg-gray-500');
            setMode(currentMode);
            filterToggle.classList.remove('hidden');
            isFirstLoad = false;

            toast("Welcome to PerfGame!")
            exec(`su -lp 2000 -c "/system/bin/cmd notification post -t 'PerfGame' -i file:///sdcard/.perfgame/perfgame.png -I file:///sdcard/.perfgame/perfgame.png 'perfgame' 'WebUI running: ${currentMode} mode applied.'" >/dev/null &`);

            gameList.forEach(game => {
                if (gameNameMapping[game]) {
                    executeCommand(`cmd game mode ${currentMode.toLowerCase()} ${game}`);
                    addGameConfiguration(game);
                    updateGameConfigurationUI(game);
                } else {
                    executeCommand(`cmd game mode ${currentMode.toLowerCase()} ${game}`);
                    addGameConfiguration(game);
                    updateGameConfigurationUI(game);
                }
            });
        }
    }
    
    loadGameList();
    
    function getGameName(packageName) {
        return gameNameMapping[packageName] || packageName;
    }
    
    function addGameConfiguration(packageName) {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'container rounded-3xl p-4 mb-4 flex items-center space-x-4 w-full max-w-md';
        
        const gameIcon = document.createElement('img');
        gameIcon.alt = `${packageName} game icon`;
        gameIcon.className = 'w-16 h-16 rounded';
        
        const localStorageKey = `gameIcon-${packageName}`;
        const localStorageKeyDefault = `gameIcon-default`;
        const cachedIcon = localStorage.getItem(localStorageKey);
        const defaultIcon = localStorage.getItem(localStorageKeyDefault);
        
        if (cachedIcon) {
            gameIcon.src = cachedIcon;
        } else {
            const [externalWebpUrl,
                externalPngUrl] = getGameIcon(packageName);
            gameIcon.src = externalWebpUrl;
            gameIcon.onerror = function () {
                this.src = externalPngUrl;
                this.onerror = function () {
                    this.src = 'https://raw.githubusercontent.com/adivenxnataly/PerfGame/main/assets/icons/default.png';
                    this.onerror = function () {
                        if (defaultIcon) {
                            toast('')
                            this.src = defaultIcon;
                        } else {
                            this.src = '/sdcard/.perfgame/perfgame.png';
                        }
                    };
                };
            };
        }
        
        gameContainer.appendChild(gameIcon);
        
        const gameContent = document.createElement('div');
        gameContent.className = 'flex-1';
        
        const gameName = document.createElement('h2');
        gameName.className = 'text-xl font-bold';
        gameName.textContent = getGameName(packageName);
        gameContent.appendChild(gameName);
        
        if (!gameNameMapping[packageName]) {
            const unsupportedIconContainer = document.createElement('div');
            unsupportedIconContainer.style.position = 'relative';
            unsupportedIconContainer.style.display = 'inline-block';
            
            const unsupportedIcon = document.createElement('span');
            unsupportedIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#991b1b" height="24" width="24">
              <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
            </svg>
            `;
            unsupportedIcon.style.marginLeft = '8px';
            unsupportedIcon.style.cursor = 'pointer';
            
            const tooltip = document.createElement('div');
            tooltip.className = 'hide';
            tooltip.textContent = 'not fully supported';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#991b1b';
            tooltip.style.color = 'white';
            tooltip.style.padding = '2px 8px';
            tooltip.style.borderRadius = '7px';
            tooltip.style.fontSize = '10px';
            tooltip.style.display = 'none';
            tooltip.style.zIndex = '1001';
            tooltip.style.top = '140%';
            tooltip.style.whiteSpace = 'nowrap';
            
            unsupportedIcon.addEventListener('click', function(event) {
                event.stopPropagation();
                tooltip.classList.remove('hide');
                tooltip.classList.add('show');
                tooltip.style.display = 'block';
            });
            
            document.addEventListener('click', function(event) {
                const isClickInsideTooltip = tooltip.contains(event.target);
                const isClickOnIcon = unsupportedIcon.contains(event.target);
                
                if (!isClickInsideTooltip && !isClickOnIcon) {
                    tooltip.classList.remove('show');
                    tooltip.classList.add('hide');
                    tooltip.addEventListener('animationend', function() {
                        if (tooltip.classList.contains('hide')) {
                            tooltip.style.display = 'none';
                        }
                    },
                    {
                        once: true
                    });
                }
            });
            
            unsupportedIconContainer.appendChild(unsupportedIcon);
            unsupportedIconContainer.appendChild(tooltip);
            gameName.appendChild(unsupportedIconContainer);
        }
        
        gameContent.appendChild(gameName);
        
        const configuredText = document.createElement('span');
        configuredText.id = `configured-text-${packageName}`;
        configuredText.className = 'configured-border text-white hidden';
        configuredText.textContent = 'configured';
        gameContent.appendChild(configuredText);
        
        const resetedText = document.createElement('span');
        resetedText.id = `reseted-text-${packageName}`;
        resetedText.className = 'reseted-border text-white hidden';
        resetedText.textContent = 'reseted';
        gameContent.appendChild(resetedText);
        
        const resolutionInfo = document.createElement('span');
        resolutionInfo.id = `resolution-info-${packageName}`;
        resolutionInfo.className = 'border-resinfo text-white mt-1';
        gameContent.appendChild(resolutionInfo);
        
        getResolutionHeight(packageName,
            function(resolutionHeight) {
                if (resolutionHeight) {
                    resolutionInfo.textContent = `${resolutionHeight}P`;
                } else {
                    resolutionInfo.classList.add('hidden');
                }
            });
        
        const resolutionConfig = document.createElement('div');
        resolutionConfig.className = 'mt-2';
        resolutionConfig.innerHTML = `
        <p>Resolution</p>
        <div class="relative pt-1">
        <input type="range" id="resolution-${packageName}" name="resolution" min="0.3" max="1.0" step="0.05" value="1.0" class="w-full">
        <span class="status text-sm text-gray-400" id="resolution-value-${packageName}">100%</span>
        </div>
        `;
        gameContent.appendChild(resolutionConfig);
        
        const fpsConfig = document.createElement('div');
        fpsConfig.className = 'mt-2';
        fpsConfig.innerHTML = `
        <p>FPS</p>
        <div class="relative pt-1">
        <input type="range" id="fps-${packageName}" name="fps" min="30" max="120" step="15" value="60" class="w-full">
        <span class="status text-sm text-gray-400" id="fps-value-${packageName}">60</span>
        </div>
        `;
        gameContent.appendChild(fpsConfig);
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'mt-4 flex space-x-2';
        buttonsContainer.innerHTML = `
        <button id="apply-config-${packageName}" class="config bg-blue-950 text-white p-2 rounded-lg flex-1">Apply</button>
        <button id="reset-config-${packageName}" class="config bg-red-800 text-white p-2 rounded-lg flex-1">Reset</button>
        `;
        gameContent.appendChild(buttonsContainer);
        gameContainer.appendChild(gameContent);
        gameListContainer.appendChild(gameContainer);
        
        const resolutionSlider = document.getElementById(`resolution-${packageName}`);
        const resolutionValue = document.getElementById(`resolution-value-${packageName}`);
        resolutionSlider.addEventListener('input',
            function() {
                resolutionValue.textContent = `${Math.round(this.value * 100)}%`;
            });
        
        const fpsSlider = document.getElementById(`fps-${packageName}`);
        const fpsValue = document.getElementById(`fps-value-${packageName}`);
        
        fpsSlider.addEventListener('input',
            function() {
                const currentValue = parseInt(this.value);
                if (currentValue < 60) {
                    this.step = 15;
                } else {
                    this.step = 30;
                }
                fpsValue.textContent = currentValue;
            });
        
        document.getElementById(`apply-config-${packageName}`).addEventListener('click',
            function() {
                applyConfiguration(packageName);
            });
        document.getElementById(`reset-config-${packageName}`).addEventListener('click',
            function() {
                resetConfiguration(packageName);
            });
    }
    
    function updateSliderFill(slider) {
        const value = slider.value;
        const min = slider.min || 0;
        const max = slider.max || 100;
        const percent = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--fill-percent',
            `${percent}%`);
    }
    
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', () => updateSliderFill(slider));
        updateSliderFill(slider);
    });
    
    function updateGameConfigurationUI(packageName) {
        const command = `device_config get game_overlay ${packageName}`;
        executeCommand(command,
            function(output) {
                const configuredText = document.getElementById(`configured-text-${packageName}`);
                const resolutionSlider = document.getElementById(`resolution-${packageName}`);
                const resolutionValue = document.getElementById(`resolution-value-${packageName}`);
                const fpsSlider = document.getElementById(`fps-${packageName}`);
                const fpsValue = document.getElementById(`fps-value-${packageName}`);
                if (!output || output.trim() === "" || output.trim().toLowerCase() === "null") {
                    configuredText.classList.add('hidden');
                    if (!document.getElementById(`reseted-text-${packageName}`).classList.contains('hidden')) {
                        const savedConfig = localStorage.getItem(`gameConfig_${packageName}`);
                        if (savedConfig) {
                            const config = JSON.parse(savedConfig);
                            if (config.downscaleFactor) {
                                resolutionSlider.value = config.downscaleFactor;
                                resolutionValue.textContent = `${Math.round(config.downscaleFactor * 100)}%`;
                                updateSliderFill(resolutionSlider);
                            }
                            if (config.fps) {
                                fpsSlider.value = config.fps;
                                fpsValue.textContent = config.fps;
                                updateSliderFill(fpsSlider);
                            }
                            configuredText.classList.remove('hidden');
                        }
                    }
                    return;
                }
                const config = parseGameOverlayConfig(output.trim());
                if (config.downscaleFactor) {
                    resolutionSlider.value = config.downscaleFactor;
                    resolutionValue.textContent = `${Math.round(config.downscaleFactor * 100)}%`;
                    updateSliderFill(resolutionSlider);
                }
                if (config.fps) {
                    fpsSlider.value = config.fps;
                    fpsValue.textContent = config.fps;
                    updateSliderFill(fpsSlider);
                }
                configuredText.classList.remove('hidden');
                localStorage.setItem(`gameConfig_${packageName}`, JSON.stringify(config));
            });
    }
    
    function parseGameOverlayConfig(configString) {
        const config = {};
        if (!configString || configString.trim() === "") {
            return config;
        }
        
        const parts = configString.split(',');
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key === 'downscaleFactor') {
                config.downscaleFactor = parseFloat(value);
            } else if (key === 'fps') {
                config.fps = parseInt(value);
            }
        });
        
        return config;
    }
    
    function applyConfiguration(packageName) {
        const resolution = document.getElementById(`resolution-${packageName}`).value;
        const fps = document.getElementById(`fps-${packageName}`).value;
        const configCommand = `device_config put game_overlay ${packageName} mode=2,fps=${fps},downscaleFactor=${resolution}:mode=3,fps=${fps},downscaleFactor=${resolution}`;
        executeCommand(configCommand,
            function(output) {
                toast(`apply for ${getGameName(packageName)}`);
                const configuredText = document.getElementById(`configured-text-${packageName}`);
                const resetedText = document.getElementById(`reseted-text-${packageName}`);
                configuredText.classList.add('blue');
                configuredText.textContent = 'reconfigure';
                resetedText.classList.add('hidden');
                setTimeout(() => {
                    configuredText.textContent = 'configured';
                    configuredText.classList.remove('blue');
                }, 3000);
                updateGameConfigurationUI(packageName);
            });
    }
    
    function resetConfiguration(packageName) {
        const deleteCommand = `device_config delete game_overlay ${packageName}`;
        executeCommand(deleteCommand,
            function(output) {
                toast(`reset for ${getGameName(packageName)}`);
                localStorage.removeItem(`gameConfig_${packageName}`);
                const configuredText = document.getElementById(`configured-text-${packageName}`);
                configuredText.classList.add('hidden');
                const resetedText = document.getElementById(`reseted-text-${packageName}`);
                resetedText.classList.remove('hidden');
                setTimeout(() => {
                    resetedText.classList.add('hidden');
                }, 3000);
            });
    }
    
    function checkConfiguration(packageName) {
        const command = `device_config get game_overlay ${packageName}`;
        executeCommand(command,
            function(output) {
                const configuredText = document.getElementById(`configured-text-${packageName}`);
                if (output && output.trim() !== "") {
                    configuredText.classList.remove('hidden');
                } else {
                    configuredText.classList.add('hidden');
                }
            });
    }
    
    function notConfiguration(packageName) {
        const command = `device_config get game_overlay ${packageName}`;
        executeCommand(command,
            function(output) {
                const configuredText = document.getElementById(`configured-text-${packageName}`);
                if (output && output.trim() !== "") {
                    configuredText.classList.add('hidden');
                } else {
                    configuredText.classList.remove('hidden');
                }
            });
    }
    
    function getResolutionHeight(packageName, callback) {
        const command = `grep 'Screenmanager%20Resolution%20Height' /data/data/${packageName}/shared_prefs/${packageName}.v2.playerprefs.xml| awk -F'value="' '{print $2}' | awk -F'"' '{print $1}'`;
        executeCommand(command,
            function(output) {
                if (output && output.trim() !== "") {
                    callback(output.trim());
                } else {
                    callback(null);
                }
            });
    }
    
    document.querySelectorAll('#mode-options a').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.id.replace('-option', '').replace('battery', 'Saver');
            const formattedMode = mode.charAt(0).toUpperCase() + mode.slice(1);

            setMode(formattedMode);

            hideModeOptions();
        });
    });
    
    function setMode(mode) {
        if (!gamesDetected) {
            alert("No games detected!");
            return;
        }
        
        exec(`echo "${mode.toLowerCase()}" > /data/adb/modules/PerfGame/mode.conf`);
        exec(`perfgame ${mode.toLowerCase()}`);
        
        toast(`${mode}`);
        currentMode = mode;
        localStorage.setItem('selectedMode', mode);
        currentModeButton.textContent = mode;
        
        modeIndicator.classList.remove('bg-red-600', 'bg-green-400', 'bg-orange-400');
        modePopup.classList.remove(
            'bg-red-600', 'bg-green-400', 'bg-orange-400',
            'before-border-red-600', 'before-border-green-400', 'before-border-orange-400'
        );
        
        let toastMessage = "";
        if (mode === 'Performance') {
            modeIndicator.classList.add('bg-red-600');
            modePopup.classList.add('bg-red-600', 'before-border-red-600');
            toastMessage = "Performance Mode";
            
        } else if (mode === 'Balance') {
            modeIndicator.classList.add('bg-green-400');
            modePopup.classList.add('bg-green-400', 'before-border-green-400');
            toastMessage = "Balance Mode";
        } else if (mode === 'Saver') {
            modeIndicator.classList.add('bg-orange-400');
            modePopup.classList.add('bg-orange-400', 'before-border-orange-400');
            toastMessage = "Battery Saver Mode";
        }
        
        exec('pkill -SIGUSR1 perfutils');
        
        if (isFirstLoad) {
            setTimeout(() => {
                showModePopup(`${toastMessage} activated!`, true);
            }, 3000);
        } else {
            showModePopup(`${toastMessage} activated!`, true);
        }
        
        const games = document.querySelectorAll('#game-list > div');
        games.forEach(game => {
            const gameNameElement = game.querySelector('h2');
            if (gameNameElement) {
                const packageName = gameNameElement.textContent;
                executeCommand(`cmd game mode ${mode.toLowerCase()} ${packageName}`);
            }
        });
        
        hideModeOptions();
    }

    function showModePopup(message, fromClick = false) {
        if (isFirstLoad) return;
        clearTimeout(modePopup.timeoutId);
        clearTimeout(modeIndicator.scaleTimeoutId);
        modePopup.textContent = message;
        if (fromClick) {
            modeIndicator.style.transition = 'transform 0.3s ease';
            modeIndicator.style.transform = 'scale(1.3)';

            modeIndicator.scaleTimeoutId = setTimeout(() => {
                modeIndicator.style.transform = 'scale(1)';
            }, 3000);
        }

        modePopup.style.transition = 'none';
        modePopup.style.opacity = '0';
        modePopup.style.transform = 'translateX(-50%) translateY(-10px)';
        modePopup.classList.remove('hidden');

        void modePopup.offsetHeight;

        modePopup.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)';
        modePopup.style.opacity = '1';
        modePopup.style.transform = 'translateX(-50%) translateY(5px)';

        modePopup.timeoutId = setTimeout(() => {
            modePopup.style.opacity = '0';
            modePopup.style.transform = 'translateX(-50%) translateY(-10px)';

            modePopup.timeoutId = setTimeout(() => {
                modePopup.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    function hideModeOptions() {
        modeOptions.classList.remove('show');
        modeOptions.classList.add('hide');

        currentModeButton.style.transform = 'scale(1)';
        currentModeButton.classList.remove('bg-neutral-950');
        currentModeButton.classList.add('bg-blue-900');

        isModeOptionsVisible = false;

        setTimeout(() => {
            modeOptions.style.display = 'none';
        }, 300);
    }

    modeIndicator.addEventListener('click', function(event) {
        event.stopPropagation();

        let message = "";
        switch (currentMode) {
            case 'Performance':
                message = "🔥 Performance Mode Active";
                break;
            case 'Balance':
                message = "⚖️ Balanced Performance";
                break;
            case 'Saver':
                message = "🔋 Battery Saver Active";
                break;
        }

        showModePopup(message, true);
    });

    document.addEventListener('click', function() {
        if (!modePopup.classList.contains('hidden')) {
            modePopup.style.opacity = '0';
            modePopup.style.transform = 'translateX(-50%) translateY(-10px)';
            modeIndicator.style.transform = 'scale(1)';
        }
    });

    function toggleModeOptions(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!gamesDetected) {
            alert("No games detected!");
            return;
        }

        if (isModeOptionsVisible) {
            modeOptions.classList.remove('show');
            modeOptions.classList.add('hide');

            currentModeButton.style.transform = 'scale(1)';
            currentModeButton.classList.remove('bg-neutral-950');
            currentModeButton.classList.add('bg-blue-900');

            setTimeout(() => {
                modeOptions.classList.add('hidden');
                modeOptions.style.display = 'none';
                modeOptions.classList.remove('hide');
            }, 300);
        } else {
            modeOptions.classList.remove('hidden');
            modeOptions.style.display = 'block';
            void modeOptions.offsetHeight;
            modeOptions.classList.remove('hide');
            modeOptions.classList.add('show');

            currentModeButton.style.transform = 'scale(1.1)';
            currentModeButton.classList.remove('bg-blue-900');
            currentModeButton.classList.add('bg-neutral-950');
        }

        isModeOptionsVisible = !isModeOptionsVisible;
    }

    currentModeButton.addEventListener('click', toggleModeOptions);

    document.addEventListener('click', function(event) {
        if (isModeOptionsVisible &&
            !modeOptions.contains(event.target) &&
            event.target !== currentModeButton) {
            toggleModeOptions(event);
        }
    });

    modeOptions.addEventListener('click',
        function(event) {
            event.stopPropagation();
        });

    performanceOption.addEventListener('click',
        function(event) {
            event.preventDefault();
            setMode('Performance');
            modeOptions.classList.add('hidden');
            isModeOptionsVisible = false;
        });

    balanceOption.addEventListener('click',
        function(event) {
            event.preventDefault();
            setMode('Balance');
            modeOptions.classList.add('hidden');
            isModeOptionsVisible = false;
        });

    batteryOption.addEventListener('click',
        function(event) {
            event.preventDefault();
            setMode('Saver');
            modeOptions.classList.add('hidden');
            isModeOptionsVisible = false;
        });

    helpButton.addEventListener('click',
        function(event) {
            event.preventDefault();
            popupMessage.innerHTML = `
            PerfGame is a module that implements <a class="font-bold">Game Interventions</a>.
            <br>
            What is <a class="font-bold">Game Interventions?</a>
            <br><br>
            For more information, please see
            <a href="https://github.com/adivenxnataly/PerfGame"
            class="text-blue-400 hover:underline inline-flex items-center mb-0"
            style="transform: translateY(2px);"
            target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-3">
            <path fill-rule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clip-rule="evenodd" />
            </svg>
            my Github
            </a>.
            <br><br><br>
            <a class="font-mono" style="color: #888888; font-size: 10px;">v2.0-release</a>
            <a style="color: #999999; font-size: 10px;">by</a>
            <a style="font-size: 10px; color: #999999;">@adivenxnataly</a>
            `;
            popup.classList.remove('hidden');
        });

    popup.addEventListener('click',
        function(event) {
            if (event.target === popup) {
                popup.classList.add('hidden');
            }
        });

    function executeCommand(command, callback) {
        const callbackName = `exec_callback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        window[callbackName] = (errno,
            stdout,
            stderr) => {
            if (errno !== 0 || !stdout || stdout.trim() === "" || stdout.trim().toLowerCase() === "null") {
                if (callback) callback(null);
            } else {
                if (callback) callback(stdout);
            }

            delete window[callbackName];
        };

        // in this case i'm using "ksu.exec" bcs idk why "exec" not give callback
        try {
            ksu.exec(command, JSON.stringify({}), callbackName);
        } catch (error) {
            if (callback) callback(null);
        }
    }
});
