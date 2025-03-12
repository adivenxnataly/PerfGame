async function fetchGameList() {
    try {
        const response = await fetch('gamelist.txt');
        if (response.ok) {
            const text = await response.text();
            const fileGameList = text.split('\n').filter(line => line.trim() !== "");
            return fileGameList;
        } else {
            throw new Error('Failed to load gamelist.txt');
        }
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

fetchGameList().then(fileGameList => {
    combinedGameList = [...new Set([...combinedGameList, ...fileGameList])];
});

let combinedGameList = [...gameList];

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

    const gameNameMapping = {
        'com.miHoYo.GenshinImpact': 'Genshin Impact',
        'com.mobile.legends': 'Mobile Legends: Bang Bang',
        'com.HoYoverse.hkrpgoversea': 'Honkai: Star Rail',
        'com.HoYoverse.Nap': 'Zenless Zone Zero',
        'com.kurogame.wutheringwaves.global': 'Wuthering Waves',
        'com.tencent.ig': 'PUBG: Mobile',
        'com.garena.game.codm': 'COD: Mobile',
        'com.activision.callofduty.warzone': 'COD: Warzone Mobile',
        'com.levelinfinite.sgameGlobal.midaspay': 'Honor of Kings',
        'com.proximabeta.mf.uamo': 'Arena Breakout',
        'com.carxtech.sr': 'CarX Street',
        'com.levelinfinite.hotta.gp': 'Tower of Fantasy',
        'com.kurogame.gplay.punishing.grayraven.en': 'PGR',
        'com.miHoYo.bh3global': 'Honkai Impact 3',
        'com.seasun.snowbreak.google': 'Snowbreak',
        'com.nexon.bluearchive': 'Blue Archive',
        'com.bushiroad.en.bangdreamgbp': 'BanG Dream!',
        'com.sega.pjsekai': 'Project Sekai',
        'com.netease.newspike': 'Blood Strike',
    };

    let isModeOptionsVisible = false;
    let gamesDetected = false;
    let currentMode = localStorage.getItem('selectedMode') || 'Performance';

    const fileGameList = await fetchGameList();
    combinedGameList = [...new Set([...combinedGameList, ...fileGameList])];

    function loadGameList() {

        if (combinedGameList.length === 0) {
            noGamesMessage.classList.remove('hidden');
            modeIndicator.classList.remove('bg-red-600', 'bg-green-400', 'bg-orange-400');
            modeIndicator.classList.add('bg-gray-500');
            gamesDetected = false;
        } else {
            noGamesMessage.classList.add('hidden');
            currentModeButton.classList.remove('hidden');
            gamesDetected = true;

            setMode(currentMode);

            combinedGameList.forEach(game => {
                if (gameNameMapping[game]) {
                    executeCommand(`cmd game mode ${currentMode.toLowerCase()} ${game}`);
                    addGameConfiguration(game);
                    updateGameConfigurationUI(game);
                } else {
                    console.warn(`Package name not supported: ${game}`);
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

    function getGameIcon(packageName) {
        const externalWebpUrl = `https://github.com/adivenxnataly/PerfGame/blob/main/webroot/icons/${packageName}.webp?raw=true`;
        const externalPngUrl = `https://github.com/adivenxnataly/PerfGame/blob/main/webroot/icons/${packageName}.png?raw=true`;

        return [externalWebpUrl, externalPngUrl];
    }

    function addGameConfiguration(packageName) {

        const gameContainer = document.createElement('div');
        gameContainer.className = 'container rounded-3xl p-4 mb-4 flex items-center space-x-4 w-full max-w-md';

        const gameIcon = document.createElement('img');
        gameIcon.alt = `${packageName} game icon`;
        gameIcon.className = 'w-16 h-16 rounded';

        const [externalWebpUrl, externalPngUrl] = getGameIcon(packageName);

        gameIcon.src = externalWebpUrl;
        gameIcon.onerror = function() {
            this.src = externalPngUrl;
            this.onerror = function() {
                this.src = `https://github.com/adivenxnataly/PerfGame/blob/main/webroot/icons/default.png?raw=true`;
            };
        };

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

            const unsupportedIcon = document.createElement('i');
            unsupportedIcon.className = 'fas fa-exclamation-circle';
            unsupportedIcon.style.fontSize = '18px';
            unsupportedIcon.style.color = '#B80F0A';
            unsupportedIcon.style.marginLeft = '8px';
            unsupportedIcon.style.cursor = 'pointer';

            const tooltip = document.createElement('div');
            tooltip.className = 'hide';
            tooltip.textContent = 'not fully supported!';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#B80F0A';
            tooltip.style.color = 'white';
            tooltip.style.padding = '2px 6px';
            tooltip.style.borderRadius = '8px';
            tooltip.style.fontSize = '10px';
            tooltip.style.display = 'none';
            tooltip.style.zIndex = '1000';
            tooltip.style.top = '150%';
            tooltip.style.whiteSpace = 'nowrap';

            unsupportedIcon.addEventListener('click', function(event) {
                event.stopPropagation();

                tooltip.classList.remove('hide');
                tooltip.classList.add('show');
                tooltip.style.display = 'block';
                tooltip.style.transform = 'translateX(-30%)';
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
        resolutionInfo.textContent = 'Loading resolution...';
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

    function updateSliderFill(slider) {
        const value = slider.value;
        const min = slider.min || 0;
        const max = slider.max || 100;
        const percent = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--fill-percent',
            `${percent}%`);
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
                alert(`Configuration applied for ${packageName}`);
                const configuredText = document.getElementById(`configured-text-${packageName}`);
                configuredText.classList.add('blue');
                configuredText.textContent = 'reconfigured';
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
                alert(`Configuration reset for ${packageName}`);
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
        const command = `grep 'Screenmanager%20Resolution%20Height' /data/data/${packageName}/shared_prefs/${packageName}.v2.playerprefs.xml | sed -n 's/.*value="\\([^"]*\\)".*/\\1/p'`;
        executeCommand(command,
            function(output) {
                if (output && output.trim() !== "") {
                    callback(output.trim());
                } else {
                    callback(null);
                }
            });
    }

    function setMode(mode) {

        if (!gamesDetected) {
            alert("No games detected!");
            return;
        }

        if (currentMode !== mode) {
            currentMode = mode;
            localStorage.setItem('selectedMode', mode);
        }

        currentModeButton.textContent = mode;

        modeIndicator.classList.remove('bg-red-600', 'bg-green-400', 'bg-orange-400');
        if (mode === 'Performance') {
            modeIndicator.classList.add('bg-red-600');
        } else if (mode === 'Balance') {
            modeIndicator.classList.add('bg-green-400');
        } else if (mode === 'Saver') {
            modeIndicator.classList.add('bg-orange-400');
        }

        const games = document.querySelectorAll('#game-list > div');
        games.forEach(game => {
            const gameNameElement = game.querySelector('h2');
            if (gameNameElement) {
                const packageName = gameNameElement.textContent;
                executeCommand(`cmd game mode ${mode.toLowerCase()} ${packageName}`);
                console.log(`cmd game mode ${mode.toLowerCase()} ${packageName}`);
            }
        });
    }

    function showModeOptions() {
        modeOptions.classList.remove('hide');
        modeOptions.style.display = 'block';
        void modeOptions.offsetHeight;
        modeOptions.classList.add('show');
        isModeOptionsVisible = true;
        console.log("menampilkan");
        console.log(isModeOptionsVisible);

        event.stopPropagation();
        modeOptions.style.pointerEvents = 'none';

        setTimeout(() => {
            modeOptions.style.pointerEvents = 'auto';
        },
            1000);
    }

    function hideModeOptions() {
        modeOptions.classList.remove('show');
        modeOptions.classList.add('hide');
        console.log("menyembunyikan");
        console.log(isModeOptionsVisible);

        isModeOptionsVisible = false;
        setTimeout(() => {
            modeOptions.style.display = 'none';
        },
            300);
    }

    currentModeButton.addEventListener('click',
        function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (isModeOptionsVisible) {
                console.log(`click ${isModeOptionsVisible}`);
                hideModeOptions();
            } else {
                console.log(`click ${isModeOptionsVisible}`);
                showModeOptions();
            }
        });

    document.addEventListener('click',
        function (event) {
            if (!modeOptions.contains(event.target)) {
                hideModeOptions();
            }
        });

    modeOptions.addEventListener('click',
        function (event) {
            event.stopPropagation();
        });


    currentModeButton.addEventListener('click',
        function(event) {
            event.preventDefault();
            if (!gamesDetected) {
                alert("No games detected!");
                return;
            }
            modeOptions.classList.toggle('hidden');
            isModeOptionsVisible = !isModeOptionsVisible;
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
            popupMessage.textContent = "This Global Mode is the mode used by Games (that support it), this is provided by Game Interventions (API 31).";
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

        try {
            ksu.exec(command, JSON.stringify({}), callbackName);
        } catch (error) {
            if (callback) callback(null);
        }
    }
});
