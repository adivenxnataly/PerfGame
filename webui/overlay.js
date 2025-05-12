import { exec } from 'kernelsu';
import { toast } from 'kernelsu';

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('overlay-content');
    const overlay = document.getElementById('filter-overlay');
    const toggleBtn = document.getElementById('filter-toggle');
    const closeBtn = document.getElementById('close-filter');
    const vibranceSlider = document.getElementById('vibrance-slider');
    const saturationSlider = document.getElementById('saturation-slider');
    const vibranceValue = document.getElementById('vibrance-value');
    const saturationValue = document.getElementById('saturation-value');
    const resetBtn = document.getElementById('reset-btn');
    const vsyncToggle = document.getElementById('vsync-toggle');
    const vsyncSwitch = document.getElementById('vsync-toggle-switch');
    const styleOffBtn = document.getElementById('style-off');
    const styleBrightBtn = document.getElementById('style-bright');
    const styleWarmBtn = document.getElementById('style-warm');
    const vsyncConfirmPopup = document.getElementById('vsync-confirm-popup');
    const vsyncConfirmYes = document.getElementById('vsync-confirm-yes');
    const vsyncConfirmNo = document.getElementById('vsync-confirm-no');
    const failed = document.getElementById('fail-icon');

    const gamePackageInput = document.getElementById('game-package-input');
    const addGameBtn = document.getElementById('add-game-btn');
    const addGameStatus = document.getElementById('add-game-status');
    const deleteModeToggle = document.getElementById('delete-mode-toggle');

    let isDeleteMode = false;
    let currentStyle = 'off';
    let vsyncEnabled = false;
    let lastColorValue = null;
    let pendingVsyncState = false;

    updateVsyncToggle();
    setStyle('off');
    updateSliderValue(vibranceSlider);
    updateSliderValue(saturationSlider);

    toggleBtn.addEventListener('click', () => overlay.classList.toggle('hidden'));
    closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

    let isOverlayOpen = false;
    let scrollPosition = 0;

    function toggleOverlay() {
        const overlay = document.getElementById('filter-overlay');
        const body = document.body;

        if (!isOverlayOpen) {
            scrollPosition = window.pageYOffset;
            content.classList.remove('hidden');
            overlay.classList.remove('hidden');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.top = `-${scrollPosition}px`;
            body.style.width = '100%';
            isOverlayOpen = true;
        } else {
            content.classList.add('hidden');
            overlay.classList.add('hidden');
            body.style.overflow = '';
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            window.scrollTo(0, scrollPosition);
            isOverlayOpen = false;
        }
    }

    document.getElementById('filter-toggle').addEventListener('click', toggleOverlay);
    document.getElementById('close-filter').addEventListener('click', toggleOverlay);

    document.getElementById('filter-overlay').addEventListener('wheel', function(e) {
        const content = this.querySelector('.overlay-content');
        const isScrollingDown = e.deltaY > 0;

        if (content.scrollHeight > content.clientHeight) {
            const isAtTop = content.scrollTop === 0;
            const isAtBottom = content.scrollTop + content.clientHeight >= content.scrollHeight;

            if ((isAtTop && !isScrollingDown) || (isAtBottom && isScrollingDown)) {
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    });

    vsyncToggle.addEventListener('click',
        () => {
            
            if (!vsyncEnabled) {
                pendingVsyncState = !vsyncEnabled;
                vsyncConfirmPopup.classList.remove('hidden');
                overlay.style.backdropFilter = 'none';
            } else {
                vsyncEnabled = false;
                updateVsyncToggle();
                executeCommand(`service call SurfaceFlinger 1008 i32 1`);
                overlay.style.backdropFilter = 'blur(5px)';
                toast("Experimental Feature: Disabled")
            }
        });

    vsyncConfirmYes.addEventListener('click',
        () => {
            vsyncEnabled = pendingVsyncState;
            updateVsyncToggle();
            executeCommand(`service call SurfaceFlinger 1008 i32 ${vsyncEnabled ? 0: 1}`);
            vsyncConfirmPopup.classList.add('hidden');
            ksu.toast("Experimental Feature: Enabled")
            overlay.style.backdropFilter = 'blur(5px)';
        });

    vsyncConfirmNo.addEventListener('click',
        () => {
            vsyncConfirmPopup.classList.add('hidden');
            updateVsyncToggle();
            overlay.style.backdropFilter = 'blur(5px)';
        });

    function updateVsyncToggle() {
        if (vsyncEnabled) {
            vsyncSwitch.style.transform = 'translateX(115%)';
            vsyncToggle.classList.replace('bg-neutral-800', 'bg-blue-600');
            vsyncSwitch.classList.replace('bg-neutral-600', 'bg-white');
        } else {
            vsyncSwitch.style.transform = 'translateX(0)';
            vsyncToggle.classList.replace('bg-blue-600', 'bg-neutral-800');
            vsyncSwitch.classList.replace('bg-white', 'bg-neutral-600');
        }
    }

    styleOffBtn.addEventListener('click', () => setStyle('off'));
    styleBrightBtn.addEventListener('click', () => setStyle('bright'));
    styleWarmBtn.addEventListener('click', () => setStyle('warm'));

    function setStyle(style) {
        currentStyle = style;
        resetStyleButtons();

        const activeBtn = style === 'off' ? styleOffBtn:
        style === 'bright' ? styleBrightBtn: styleWarmBtn;

        activeBtn.classList.replace('bg-neutral-800', 'bg-blue-950');
        activeBtn.classList.replace('text-gray-400', 'text-white');

        executeStyleCommand();
    }

    function resetStyleButtons() {
        [styleOffBtn,
            styleBrightBtn,
            styleWarmBtn].forEach(btn => {
                btn.classList.replace('bg-blue-950', 'bg-neutral-800');
                btn.classList.replace('text-white', 'text-gray-400');
            });
    }

    function executeStyleCommand() {
        let command;
        switch (currentStyle) {
            case 'bright':
                command = 'service call SurfaceFlinger 1015 i32 1 f 1.1 f 0 f 0 f 0 f 0 f 1.1 f 0 f 0 f 0 f 0 f 1.1';
                break;
            case 'warm':
                command = 'service call SurfaceFlinger 1015 i32 1 f 1.0 f 0 f 0 f 0 f 0 f 0.9 f 0 f 0 f 0 f 0 f 0.9';
                break;
            default:
                command = 'service call SurfaceFlinger 1015 i32 0';
        }
        
        executeCommand(command);
    }

    vibranceSlider.addEventListener('input', () => {
        updateSliderValue(vibranceSlider);
            executeColorCommand();
    });

    saturationSlider.addEventListener('input', () => {
        updateSliderValue(saturationSlider);
        executeColorCommand();
    });

    function updateSliderValue(slider) {
        const value = slider.value;
        const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--fill-percent', `${percent}%`);

        if (slider === vibranceSlider) {
            vibranceValue.textContent = `${value}%`;
        } else {
            saturationValue.textContent = `${value}%`;
        }
    }
    
    function executeColorCommand() {
        const vibrance = (parseInt(vibranceSlider.value) / 100).toFixed(1);
        const saturation = (parseInt(saturationSlider.value) / 100).toFixed(1);
        const finalValue = Math.min(parseFloat(vibrance) + parseFloat(saturation), 2.0).toFixed(1);

        if (finalValue !== lastColorValue) {
            const command = `service call SurfaceFlinger 1022 f ${finalValue}`;
            executeCommand(command);
            lastColorValue = finalValue;
        }
    }
    
    resetBtn.addEventListener('click', function() {
        this.classList.replace('bg-red-900', 'bg-red-950');
        resetAllSettings();
        setTimeout(() => {
            this.classList.replace('bg-red-950', 'bg-red-900');
        }, 300);
    });
    
    function resetAllSettings() {
        vsyncEnabled = false;
        updateVsyncToggle();
        setStyle('off');
        vibranceSlider.value = 0;
        saturationSlider.value = 100;
        updateSliderValue(vibranceSlider);
        updateSliderValue(saturationSlider);
        
        executeCommand('service call SurfaceFlinger 1008 i32 0');
        executeCommand('service call SurfaceFlinger 1015 i32 0');
        executeCommand('service call SurfaceFlinger 1022 f 1.0');
    }
    
    addGameBtn.addEventListener('click', function() {
        this.classList.replace('bg-green-900', 'bg-green-950');
        addGameByPackage();
        setTimeout(() => {
            this.classList.replace('bg-green-950', 'bg-green-900');
        }, 300);
    });
    
    deleteModeToggle.addEventListener('click', () => {
        isDeleteMode = !isDeleteMode;
        
        clearTimeout(addGameStatus.hideTimeout);
        addGameStatus.classList.add('hidden');
        document.getElementById('error-icon').classList.add('hidden');
        document.getElementById('success-icon').classList.add('hidden');
        
        if (isDeleteMode) {
            deleteModeToggle.classList.replace('bg-neutral-800', 'bg-red-900');
            deleteModeToggle.classList.replace('text-gray-400', 'text-white');
            addGameBtn.textContent = 'Delete';
            addGameBtn.classList.replace('bg-green-900', 'bg-red-900');
            showAddGameStatus('Delete mode activated', 'red');
        } else {
            deleteModeToggle.classList.replace('bg-red-900', 'bg-neutral-800');
            deleteModeToggle.classList.replace('text-white', 'text-gray-400');
            addGameBtn.textContent = 'Add';
            addGameBtn.classList.replace('bg-red-900', 'bg-green-900');
            showAddGameStatus('Delete mode deactivated', 'green');
        }
    });
    
    function addGameByPackage() {
        const packageName = gamePackageInput.value.trim();
        const targetFile = '/data/adb/modules/PerfGame/webroot/gamelist.txt';
            
        if (!packageName) {
            showAddGameStatus('package name cannot be empty!', 'error');
            return;
        }
            
        if (!/^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(packageName)) {
            showAddGameStatus('invalid package name format', 'red');
            return;
        }
        
        if (isDeleteMode) {
        const command = `
            if grep -q "^${packageName}$" ${targetFile}; then
                sed -i '/^${packageName}$/d' ${targetFile} && echo 0 || echo 1;
            else
                echo 1;
            fi
        `;
        
        exec(command);
        showAddGameStatus('Game removed!', 'green');
        toast("Restarting PerfGame..");
        setTimeout(() => {
            gamePackageInput.value = '';
            exec(`sleep 3; killall io.github.a13e300.ksuwebui; . /data/adb/modules/PerfGame/actions.sh`);
            }, 400);
        setTimeout(refreshGameList, 500);
        } else {
            const command = `
                if ! grep -q "^${packageName}$" ${targetFile}; then
                    echo "${packageName}" >> ${targetFile};
                    echo 0;
                else
                    echo 1;
                fi
            `;
            
            exec(command);
            showAddGameStatus('Game added!', 'green');
            toast("Restarting PerfGame..");
            setTimeout(() => {
                gamePackageInput.value = '';
                exec(`sleep 3; killall io.github.a13e300.ksuwebui; . /data/adb/modules/PerfGame/actions.sh`);
                }, 400);
            setTimeout(refreshGameList, 500);
        }
        
    }
    
    function showAddGameStatus(message, type) {
        addGameStatus.classList.add('hidden');
        document.getElementById('success-icon').classList.add('hidden');
        document.getElementById('error-icon').classList.add('hidden');
        clearTimeout(addGameStatus.hideTimeout);
        
        let textColor,
        activeIcon;
        switch (type) {
            case 'green':
                textColor = '#80ef80';
                activeIcon = document.getElementById('success-icon');
                break;
            case 'red':
                case 'error':
                    textColor = '#f94449';
                    activeIcon = document.getElementById('error-icon');
                break;
            default:
                textColor = '#9ca3af';
        }
        
        if (activeIcon) {
            activeIcon.classList.remove('hidden');
        }
        
        addGameStatus.textContent = message;
        addGameStatus.style.color = textColor;
        addGameStatus.classList.remove('hidden');
        
        addGameStatus.hideTimeout = setTimeout(() => {
            addGameStatus.classList.add('hidden');
            if (activeIcon) activeIcon.classList.add('hidden');
        }, 3000);
    }

    function executeCommand(command, callback) {
        if (typeof ksu !== 'undefined' && exec) {
            try {
                const result = exec(command);
                if (callback) callback(result === 0);
            } catch (e) {
                if (callback) callback(false);
            }
        } else {
            if (callback) callback(false);
        }
    }
});
