let scene, camera, renderer;
let avatar, avatarSprite;
let environmentTexture;

init();

async function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 3, 0);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xff00ff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.5);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 10);
    pointLight1.position.set(-5, 5, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ff00, 1, 10);
    pointLight2.position.set(5, 5, -5);
    scene.add(pointLight2);

    createBasicRoom();
    
    window.addEventListener('resize', onWindowResize);
    
    setupChat();
    setupGenerateButton();
    
    animate();
}

function createBasicRoom() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0xff00ff);
    scene.add(gridHelper);
}

async function generateEnvironment() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
    loadingDiv.textContent = 'GENERATING CYBERPUNK ENVIRONMENT...';
    
    try {
        const response = await fetch('http://localhost:3000/api/generate-environment');
        const data = await response.json();
        
        if (data.imageUrl) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(data.imageUrl, (texture) => {
                clearRoom();
                createEnvironmentFromTexture(texture);
                loadingDiv.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Failed to generate environment:', error);
        loadingDiv.textContent = 'FAILED TO GENERATE ENVIRONMENT';
        setTimeout(() => loadingDiv.style.display = 'none', 3000);
    }
}

async function generateAvatar() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
    loadingDiv.textContent = 'GENERATING PIXEL AVATAR...';
    
    try {
        const response = await fetch('http://localhost:3000/api/generate-avatar');
        const data = await response.json();
        
        if (data.imageUrl) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(data.imageUrl, (texture) => {
                createAvatarFromTexture(texture);
                loadingDiv.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Failed to generate avatar:', error);
        loadingDiv.textContent = 'FAILED TO GENERATE AVATAR';
        setTimeout(() => loadingDiv.style.display = 'none', 3000);
    }
}

function clearRoom() {
    const objectsToRemove = [];
    scene.traverse((child) => {
        if (child.type === 'Mesh' || child.type === 'GridHelper') {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));
}

function createEnvironmentFromTexture(texture) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallGeometry = new THREE.PlaneGeometry(20, 10);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.9,
        metalness: 0.1
    });

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 5, -10);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-10, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(10, 5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
}

function createAvatarFromTexture(texture) {
    if (avatarSprite) {
        scene.remove(avatarSprite);
    }
    
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    
    avatarSprite = new THREE.Sprite(spriteMaterial);
    avatarSprite.scale.set(4, 4, 1);
    avatarSprite.position.set(0, 3, -5);
    
    scene.add(avatarSprite);
    avatar = avatarSprite;
}

function setupGenerateButton() {
    const generateButton = document.getElementById('generate-button');
    generateButton.addEventListener('click', async () => {
        await generateEnvironment();
        await generateAvatar();
    });
}

function setupChat() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatHistory = document.getElementById('chat-history');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessageToHistory('YOU', message, 'user-message');
        chatInput.value = '';

        animateAvatarTalking();

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessageToHistory('AI', data.reply, 'avatar-message');
        } catch (error) {
            console.error('Error:', error);
            addMessageToHistory('AI', 'ERROR: CONNECTION FAILED. CHECK SERVER.', 'avatar-message');
        }

        stopAvatarTalking();
    };

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function addMessageToHistory(sender, message, className) {
    const chatHistory = document.getElementById('chat-history');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.textContent = `[${sender}] ${message}`;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

let talkingAnimation;
function animateAvatarTalking() {
    let time = 0;
    talkingAnimation = setInterval(() => {
        if (avatar) {
            avatar.rotation.z = Math.sin(time * 5) * 0.1;
            time += 0.1;
        }
    }, 50);
}

function stopAvatarTalking() {
    clearInterval(talkingAnimation);
    if (avatar) {
        avatar.rotation.z = 0;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (avatar) {
        avatar.position.y = 3 + Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    renderer.render(scene, camera);
}

setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
}, 1000);