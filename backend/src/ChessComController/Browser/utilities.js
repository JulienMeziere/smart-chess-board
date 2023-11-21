function observeClassChanges(targetSelector, callback) {
    const targetNode = document.querySelector(targetSelector);

    if (!targetNode) {
        console.error(`Element with selector ${targetSelector} not found.`);
        return null;
    }

    const config = { attributes: true, attributeFilter: ['class'] };

    const mutationCallback = function(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const currentClass = (mutation.target).className;
                console.log(`Class name changed to: ${currentClass}`);

                callback(currentClass);
            }
        }
    };

    const observer = new MutationObserver(mutationCallback);
    observer.observe(targetNode, config);

    return observer;
}

function delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function autoLogin() {
    const userNameInput = document.querySelector('input[type="email"]#username');
    const passwordInput = document.querySelector('input[type="password"]#password');
    const submitButton = document.querySelector('button[type="submit"]#login');

    if (!userNameInput || !passwordInput || !submitButton) return;

    const rememberMeCheckbox = document.querySelector('input[type="checkbox"]#_remember_me');
    if (rememberMeCheckbox) rememberMeCheckbox.checked = true;

    userNameInput.value = USERNAME;
    passwordInput.value = PASSWORD;
    submitButton.click();
}

async function launchGame() {
    const popupCloseButton = document.querySelector('button[type="button"][aria-label="Close"]');
    if (popupCloseButton) {
        popupCloseButton.click();
        await delay();
    }

    const playButton = document.querySelector('.selection-menu-footer button[type="button"]');
    if (!playButton) return;
    playButton.click();

    await delay();

    const secondPlayButton = document.querySelector('.selection-footer button[type="button"]');
    if (secondPlayButton) secondPlayButton.click();
}