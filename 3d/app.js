// --- Prosedürel Beton Texture Oluşturucu ---
function generateConcreteTexture(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color - medium gray concrete
    ctx.fillStyle = '#656565';
    ctx.fillRect(0, 0, size, size);

    // Surface noise / aggregate texture
    for (let i = 0; i < size * size * 0.5; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const brightness = Math.random() * 25 - 12;
        const base = 100 + brightness;
        ctx.fillStyle = `rgba(${base + Math.random() * 10},${base + Math.random() * 8},${base + Math.random() * 6},${0.3 + Math.random() * 0.35})`;
        ctx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
    }

    // Slight color variations (patches)
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 30 + 15;
        const brightness = Math.random() * 18 - 9;
        const base = 108 + brightness;
        ctx.fillStyle = `rgba(${base},${base - 2},${base - 4},${0.1 + Math.random() * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // Fine grain texture (lighter speckles)
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const v = 90 + Math.random() * 40;
        ctx.fillStyle = `rgba(${v},${v - 1},${v - 2},${0.18 + Math.random() * 0.22})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1 + 0.2, 0, Math.PI * 2);
        ctx.fill();
    }


    // Very tiny imperfections (micro scratches, dust)
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const len = Math.random() * 4 + 1;
        const angle = Math.random() * Math.PI * 2;
        ctx.strokeStyle = `rgba(${80 + Math.random() * 35},${78 + Math.random() * 30},${75 + Math.random() * 28},${0.1 + Math.random() * 0.12})`;
        ctx.lineWidth = Math.random() * 0.5 + 0.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
    }

    return canvas;
}

// --- Prosedürel Çim Texture Oluşturucu (Zemin Plakası için) ---
function generateGrassTexture(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color - rich green
    ctx.fillStyle = '#2d5a1e';
    ctx.fillRect(0, 0, size, size);

    // Noise layer for variation
    for (let i = 0; i < size * size * 0.3; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const brightness = Math.random() * 40 - 20;
        const r = 45 + brightness;
        const g = 90 + brightness + Math.random() * 30;
        const b = 30 + brightness * 0.5;
        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`;
        ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    // Grass blades - Layer 1 (dark)
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = Math.random() * 12 + 4;
        const angle = (Math.random() - 0.5) * 0.8 - Math.PI / 2;
        const g = 60 + Math.random() * 40;
        ctx.strokeStyle = `rgba(${20 + Math.random() * 20},${g},${10 + Math.random() * 15},${0.6 + Math.random() * 0.4})`;
        ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    // Grass blades - Layer 2 (medium)
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = Math.random() * 10 + 3;
        const angle = (Math.random() - 0.5) * 1.0 - Math.PI / 2;
        const g = 100 + Math.random() * 60;
        ctx.strokeStyle = `rgba(${30 + Math.random() * 25},${g},${20 + Math.random() * 20},${0.5 + Math.random() * 0.5})`;
        ctx.lineWidth = Math.random() * 1.2 + 0.3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const cx = x + Math.cos(angle) * length * 0.5 + (Math.random() - 0.5) * 3;
        const cy = y + Math.sin(angle) * length * 0.5;
        ctx.quadraticCurveTo(cx, cy, x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    // Grass blades - Layer 3 (bright highlights)
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = Math.random() * 8 + 2;
        const angle = (Math.random() - 0.5) * 0.6 - Math.PI / 2;
        const g = 140 + Math.random() * 80;
        ctx.strokeStyle = `rgba(${50 + Math.random() * 30},${g},${30 + Math.random() * 25},${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = Math.random() * 0.8 + 0.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    // Tiny dots for soil/seeds
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = `rgba(${60 + Math.random() * 40},${50 + Math.random() * 30},${20 + Math.random() * 20},${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Yellow-ish dried grass hints
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = Math.random() * 6 + 2;
        const angle = (Math.random() - 0.5) * 0.5 - Math.PI / 2;
        ctx.strokeStyle = `rgba(${120 + Math.random() * 40},${130 + Math.random() * 40},${40 + Math.random() * 20},${0.15 + Math.random() * 0.2})`;
        ctx.lineWidth = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    return canvas;
}

// Toggle beton zemin on/off
function toggleConcrete(enable) {
    grassEnabled = enable;
    if (!floorMesh) return;

    const grid = scene.getObjectByName('mainGrid');

    if (grassEnabled) {
        floorMesh.material.dispose();
        floorMesh.material = new THREE.MeshStandardMaterial({
            map: concreteTexture,
            roughness: 0.88,
            metalness: 0.02,
            color: 0x808080,
        });
        floorMesh.material.needsUpdate = true;
        floorMesh.position.y = -0.01;
        floorMesh.receiveShadow = true;
        if (grid) grid.visible = false;
    } else {
        floorMesh.material.dispose();
        floorMesh.material = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            transparent: true,
            opacity: 0.2
        });
        floorMesh.material.needsUpdate = true;
        if (grid) grid.visible = true;
    }
}

// --- Nesne Modelleri (Vanilla Three.js) ---

const createTent = () => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, flatShading: true });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1.2, 4, 32), mat);
    cone.position.set(0, 0.5, 0);
    cone.castShadow = true;
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x1a3317 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.1, 4, 4, 1), boxMat);
    box.position.set(0, 0.4, 0.6);
    group.add(cone, box);
    group.scale.set(0.8, 0.8, 0.8);
    return group;
};

const createTree = () => {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d2911 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 16, 4), trunkMat);
    trunk.position.set(0, 0.7, 0);
    trunk.castShadow = true;
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x1b4d1b, flatShading: true });
    const leaves1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), leavesMat1);
    leaves1.position.set(0, 2.2, 0);
    leaves1.castShadow = true;
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x2d5a27, flatShading: true });
    const leaves2 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), leavesMat2);
    leaves2.position.set(0, 3, 0);
    leaves2.castShadow = true;
    group.add(trunk, leaves1, leaves2);
    group.scale.set(0.5, 0.5, 0.5);
    return group;
};

const createFire = () => {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d1f05 });
    const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 8, 4), woodMat);
    w1.rotation.set(Math.PI / 2, 0, 0);
    w1.position.set(0, 0.1, 0);
    w1.castShadow = true;
    const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 8, 4), woodMat);
    w2.rotation.set(Math.PI / 2, 0, Math.PI / 3);
    w2.position.set(0, 0.1, 0);
    w2.castShadow = true;
    const fireMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 1 });
    const fire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 6, 16), fireMat);
    fire.position.set(0, 0.6, 0);
    const light = new THREE.PointLight(0xffaa00, 1.5, 5);
    light.position.set(0, 1, 0);
    light.castShadow = true;
    group.add(w1, w2, fire, light);
    group.scale.set(0.4, 0.4, 0.4);
    return group;
};

const createVan = () => {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 2.5, 8, 4, 8), bodyMat);
    body.castShadow = true;
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 2.4, 8, 2, 8), roofMat);
    roof.position.set(0, 0.6, 0);
    roof.castShadow = true;
    group.add(body, roof);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const pos = [[-0.6, -0.5, 0.8], [0.6, -0.5, 0.8], [-0.6, -0.5, -0.8], [0.6, -0.5, -0.8]];
    pos.forEach(p => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16), wheelMat);
        w.position.set(...p);
        w.rotation.set(0, 0, Math.PI / 2);
        w.castShadow = true;
        group.add(w);
    });
    group.scale.set(0.7, 0.7, 0.7);
    group.position.set(0, 0.4, 0);
    return group;
};

const createFloor = (colorHex = '#8b5a2b', textureMode = null) => {
    const group = new THREE.Group();
    let mat;
    if (textureMode === 'grass' && grassFloorTexture) {
        const tex = grassFloorTexture.clone();
        tex.needsUpdate = true;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.95,
            metalness: 0.0,
            color: 0x4a8c3f
        });
    } else {
        mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9 });
    }
    const box = new THREE.Mesh(new THREE.BoxGeometry(2, 0.02, 2, 16, 1, 16), mat);
    box.position.set(0, 0.01, 0);
    box.receiveShadow = true;
    box.castShadow = true;
    box.userData.isFloorMesh = true;
    group.add(box);
    return group;
};

const wrapInGroup = (model) => {
    const outer = new THREE.Group();
    outer.add(model);
    return outer;
};

const loadCustomGLB = (url, onLoad) => {
    const group = new THREE.Group();
    const loader = new THREE.GLTFLoader();

    // URL'yi sunucu uyumlu hale getir
    let safeUrl = url;
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
        // Zaten encode edilmiş mi kontrol et
        try {
            const decoded = decodeURIComponent(url);
            if (decoded === url) {
                // Henüz encode edilmemiş, encode et
                safeUrl = url.split('/').map((part, i) => {
                    if (i === 0 && (part === '.' || part === '..')) return part;
                    if (part === '') return part;
                    return encodeURIComponent(part);
                }).join('/');
            }
            // Zaten encode edilmişse olduğu gibi bırak
        } catch (e) {
            // decodeURIComponent hata verirse zaten encode edilmiş demektir
        }
    }

    const handleLoad = (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 5) {
            const scale = 5 / maxDim;
            model.scale.setScalar(scale);
        }
        box.setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(-center.x, -box.min.y, -center.z);
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        group.add(model);
        if (onLoad) onLoad(group);
    };

    const handleError = (error) => {
        console.warn('GLB yükleme hatası (ilk deneme):', safeUrl, error);
        // Fallback: encode edilmemiş orijinal URL ile dene
        if (safeUrl !== url) {
            console.log('Orijinal URL ile yeniden deneniyor:', url);
            loader.load(url, handleLoad, undefined, (err2) => {
                console.error('GLB yükleme hatası (her iki URL de başarısız):', url, err2);
            });
        }
    };

    loader.load(safeUrl, handleLoad, undefined, handleError);
    return group;
};

const buildRoadGroup = (item) => {
    const points = item.points;
    const group = new THREE.Group();
    if (!points || points.length === 0) return group;

    const width = item.width || 1.5;
    const material = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 1 });

    for (let i = 0; i < points.length; i++) {
        if (i < points.length - 1) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dx = p2[0] - p1[0];
            const dz = p2[1] - p1[1];
            const dist = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dx, dz);

            const segment = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, dist + width, 4, 1, Math.max(1, Math.ceil(dist) * 2)), material);
            // Z-fighting'i önlemek için (kesişen köşelerde titreşimi engellemek adına) Y yüksekliğine çok çok küçük bir offset ekliyoruz:
            segment.position.set(p1[0] + dx / 2, 0.02 + (i * 0.0005), p1[1] + dz / 2);
            segment.rotation.y = angle;
            segment.receiveShadow = true;
            group.add(segment);
        }
    }
    return group;
};

const createModel = (item, onLoad) => {
    switch (item.type) {
        case 'tent': return wrapInGroup(createTent());
        case 'tree': return wrapInGroup(createTree());
        case 'fire': return wrapInGroup(createFire());
        case 'van': return wrapInGroup(createVan());
        case 'floor': return wrapInGroup(createFloor(item.color, item.textureMode));
        case 'custom_glb':
        case 'predefined_glb':
            return loadCustomGLB(item.url, onLoad);
        default: return new THREE.Group();
    }
};

const parseDXFToGroup = (dxfString) => {
    const lines = dxfString.split(/\r\n|\r|\n/);
    const entities = [];
    let inEntitiesSection = false;

    for (let i = 0; i < lines.length; i += 2) {
        let code = lines[i]?.trim();
        let value = lines[i + 1]?.trim();

        if (code === '0' && value === 'SECTION') {
            if (lines[i + 2]?.trim() === '2' && lines[i + 3]?.trim() === 'ENTITIES') {
                inEntitiesSection = true;
                i += 2;
                continue;
            }
        }
        if (code === '0' && value === 'ENDSEC' && inEntitiesSection) inEntitiesSection = false;

        if (inEntitiesSection && code === '0') {
            let entityType = value;
            let entity = { type: entityType, vertices: [] };

            while (i + 2 < lines.length) {
                let eCode = lines[i + 2]?.trim();
                if (eCode === '0') break;
                let eVal = lines[i + 3]?.trim();
                i += 2;
                if (entityType === 'LINE') {
                    if (eCode === '10') entity.x1 = parseFloat(eVal);
                    if (eCode === '20') entity.y1 = parseFloat(eVal);
                    if (eCode === '11') entity.x2 = parseFloat(eVal);
                    if (eCode === '21') entity.y2 = parseFloat(eVal);
                } else if (entityType === 'LWPOLYLINE') {
                    if (eCode === '10') entity.currentX = parseFloat(eVal);
                    if (eCode === '20') entity.vertices.push([entity.currentX, parseFloat(eVal)]);
                } else if (entityType === 'CIRCLE' || entityType === 'ARC') {
                    if (eCode === '10') entity.cx = parseFloat(eVal);
                    if (eCode === '20') entity.cy = parseFloat(eVal);
                    if (eCode === '40') entity.r = parseFloat(eVal);
                    if (eCode === '50') entity.startAngle = parseFloat(eVal);
                    if (eCode === '51') entity.endAngle = parseFloat(eVal);
                }
            }
            if (entityType === 'LINE' && entity.x1 !== undefined) entities.push(entity);
            if (entityType === 'LWPOLYLINE' && entity.vertices.length > 0) entities.push(entity);
            if ((entityType === 'CIRCLE' || entityType === 'ARC') && entity.cx !== undefined) entities.push(entity);
        }
    }

    const outerGroup = new THREE.Group();
    const innerGroup = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });

    entities.forEach(ent => {
        let points = [];
        if (ent.type === 'LINE') {
            points.push(new THREE.Vector3(ent.x1, 0, -ent.y1));
            points.push(new THREE.Vector3(ent.x2, 0, -ent.y2));
        } else if (ent.type === 'LWPOLYLINE') {
            ent.vertices.forEach(v => points.push(new THREE.Vector3(v[0], 0, -v[1])));
        } else if (ent.type === 'CIRCLE' || ent.type === 'ARC') {
            let start = ent.startAngle ? (ent.startAngle * Math.PI / 180) : 0;
            let end = ent.endAngle ? (ent.endAngle * Math.PI / 180) : Math.PI * 2;
            if (end < start) end += Math.PI * 2;
            for (let j = 0; j <= 32; j++) {
                const theta = start + (j / 32) * (end - start);
                points.push(new THREE.Vector3(ent.cx + Math.cos(theta) * ent.r, 0, -(ent.cy + Math.sin(theta) * ent.r)));
            }
        }
        if (points.length > 0) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            innerGroup.add(ent.type === 'LWPOLYLINE' && ent.vertices.length > 2 ? new THREE.Line(geometry, material) : new THREE.LineSegments(geometry, material));
        }
    });

    outerGroup.add(innerGroup);
    outerGroup.position.y = 0.05;
    return outerGroup;
};


// --- HACİMSEL FIRÇA SİLGİSİ MOTORU (PAINT MANTIĞI) ---
const applyEraserBrushToGeometry = (hitPointWorld, object, brushRadius) => {
    const geom = object.geometry;
    if (!geom || !geom.attributes.position) return;

    if (!object.userData.geometryCloned) {
        object.geometry = geom.clone();
        object.userData.geometryCloned = true;
    }
    const currentGeom = object.geometry;
    const pos = currentGeom.attributes.position;

    const localHitPoint = hitPointWorld.clone();
    object.worldToLocal(localHitPoint);

    const scale = new THREE.Vector3();
    object.getWorldScale(scale);
    const maxScale = Math.max(scale.x, Math.max(scale.y, scale.z));
    const localRadiusSq = (brushRadius / maxScale) * (brushRadius / maxScale);

    let modified = false;

    if (object.isMesh) {
        if (currentGeom.index) {
            const index = currentGeom.index;
            const vA = new THREE.Vector3();
            const vB = new THREE.Vector3();
            const vC = new THREE.Vector3();
            for (let i = 0; i < index.count; i += 3) {
                const a = index.getX(i);
                const b = index.getX(i + 1);
                const c = index.getX(i + 2);
                if (a === b && b === c) continue;

                vA.fromBufferAttribute(pos, a);
                vB.fromBufferAttribute(pos, b);
                vC.fromBufferAttribute(pos, c);

                const center = vA.clone().add(vB).add(vC).divideScalar(3);

                if (center.distanceToSquared(localHitPoint) <= localRadiusSq ||
                    vA.distanceToSquared(localHitPoint) <= localRadiusSq ||
                    vB.distanceToSquared(localHitPoint) <= localRadiusSq ||
                    vC.distanceToSquared(localHitPoint) <= localRadiusSq) {

                    index.setX(i, a);
                    index.setX(i + 1, a);
                    index.setX(i + 2, a);
                    modified = true;
                }
            }
            if (modified) currentGeom.index.needsUpdate = true;
        } else {
            const vA = new THREE.Vector3();
            const vB = new THREE.Vector3();
            const vC = new THREE.Vector3();
            for (let i = 0; i < pos.count; i += 3) {
                vA.fromBufferAttribute(pos, i);
                vB.fromBufferAttribute(pos, i + 1);
                vC.fromBufferAttribute(pos, i + 2);

                const center = vA.clone().add(vB).add(vC).divideScalar(3);

                if (center.distanceToSquared(localHitPoint) <= localRadiusSq ||
                    vA.distanceToSquared(localHitPoint) <= localRadiusSq ||
                    vB.distanceToSquared(localHitPoint) <= localRadiusSq ||
                    vC.distanceToSquared(localHitPoint) <= localRadiusSq) {

                    pos.setXYZ(i + 1, vA.x, vA.y, vA.z);
                    pos.setXYZ(i + 2, vA.x, vA.y, vA.z);
                    modified = true;
                }
            }
            if (modified) pos.needsUpdate = true;
        }
    } else if (object.isLineSegments || object.isLine) {
        const vA = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            vA.fromBufferAttribute(pos, i);
            if (vA.distanceToSquared(localHitPoint) <= localRadiusSq) {
                const adjIdx = (i % 2 === 0) ? i + 1 : i - 1;
                if (adjIdx >= 0 && adjIdx < pos.count) {
                    const vB = new THREE.Vector3().fromBufferAttribute(pos, adjIdx);
                    pos.setXYZ(i, vB.x, vB.y, vB.z);
                }
                modified = true;
            }
        }
        if (modified) pos.needsUpdate = true;
    }
};

// --- Uygulama Durumu (State) ---
const defaultItems = [];
let items = [];
let selectedId = null;
let objectSizes = {};
let drawingMode = false;
let eraserMode = false;
let measureMode = false;
let actionHistory = [];
let currentMeasureStart = null;
let currentMeasureP2 = null;

let eraserSize = 0.8;
let dxfData = { content: null, filename: null };
let dxfUnit = 'm';
let customModels = [];
let grassEnabled = false;
let concreteTexture = null;
let grassFloorTexture = null;

const saveState = () => {
    const currentStateStr = JSON.stringify(items);
    if (actionHistory.length > 0 && JSON.stringify(actionHistory[actionHistory.length - 1]) === currentStateStr) {
        return; // already matching
    }
    actionHistory.push(JSON.parse(currentStateStr));
    if (actionHistory.length > 30) actionHistory.shift();
};

const showUndoToast = () => {
    const toast = document.getElementById('undo-toast');
    if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    }
};

const undoAction = () => {
    if (actionHistory.length > 0) {
        items = actionHistory.pop();
        selectedId = null;
        updateUI();
        showUndoToast();
    }
};

// --- IDB (IndexedDB) Storage Helper ---
const idb = {
    db: null,
    async init() {
        return new Promise((r) => {
            const req = indexedDB.open('CampPlannerDB', 1);
            req.onupgradeneeded = (e) => e.target.result.createObjectStore('data');
            req.onsuccess = (e) => { this.db = e.target.result; r(); };
            req.onerror = () => r();
        });
    },
    async get(key) {
        if (!this.db) return null;
        return new Promise(r => {
            try {
                const req = this.db.transaction('data', 'readonly').objectStore('data').get(key);
                req.onsuccess = () => r(req.result);
                req.onerror = () => r(null);
            } catch (e) { r(null); }
        });
    },
    async set(key, val) {
        if (!this.db) return;
        return new Promise(r => {
            try {
                const req = this.db.transaction('data', 'readwrite').objectStore('data').put(val, key);
                req.onsuccess = () => r();
                req.onerror = () => r();
            } catch (e) { r(); }
        });
    }
};

// --- DOM Elemanları ---
const drawingModePanel = document.getElementById('drawing-mode-panel');
const eraserModePanel = document.getElementById('eraser-mode-panel');
const btnEndDrawing = document.getElementById('btn-end-drawing');
const btnUndoRoad = document.getElementById('btn-undo-road');
const inputRoadWidth = document.getElementById('input-road-width');
const btnEndEraser = document.getElementById('btn-end-eraser');
const btnToggleEraser = document.getElementById('btn-toggle-eraser');
const labelToggleEraser = document.getElementById('label-toggle-eraser');
const eraserSliderContainer = document.getElementById('eraser-slider-container');
const inputEraserSize = document.getElementById('input-eraser-size');
const labelEraserSize = document.getElementById('label-eraser-size');
const btnToggleGrass = document.getElementById('btn-toggle-grass');
const labelToggleGrass = document.getElementById('label-toggle-grass');

const container = document.getElementById('threejs-container');
const labelItemCount = document.getElementById('label-item-count');
const btnReset = document.getElementById('btn-reset');
const itemsListContainer = document.getElementById('items-list-container');

// DXF Elements
const dxfLoadedContainer = document.getElementById('dxf-loaded-container');
const dxfUploadContainer = document.getElementById('dxf-upload-container');
const labelDxfFilename = document.getElementById('label-dxf-filename');
const btnRemoveDxf = document.getElementById('btn-remove-dxf');
const inputDxfUpload = document.getElementById('input-dxf-upload');
const btnUploadDxf = document.getElementById('btn-upload-dxf');
const dxfUnitBtns = document.querySelectorAll('.dxf-unit-btn');

// Add Items & Measure
const btnAddRoad = document.getElementById('btn-add-road');
const inputGlbUpload = document.getElementById('input-glb-upload');
const btnUploadGlb = document.getElementById('btn-upload-glb');
const btnMeasure = document.getElementById('btn-measure');

// Measure references
const measureModePanel = document.getElementById('measure-mode-panel');
const btnEndMeasure = document.getElementById('btn-end-measure');
const measureInfoText = document.getElementById('measure-info-text');
const labelsContainer = document.getElementById('labels-container');
let previewMeasureLine = null;

// Custom Library
const customLibrarySection = document.getElementById('custom-library-section');
const customLibraryGrid = document.getElementById('custom-library-grid');

// Selected Panel
const selectedItemPanel = document.getElementById('selected-item-panel');
const selectedItemLabel = document.getElementById('selected-item-label');
const selectedItemPos = document.getElementById('selected-item-pos');
const btnDeleteSelected = document.getElementById('btn-delete-selected');
const selectedItemColorSection = document.getElementById('selected-item-color-section');
const inputSelectedColor = document.getElementById('input-selected-color');
const selectedItemTransformSection = document.getElementById('selected-item-transform-section');
const inputScaleX = document.getElementById('input-scale-x');
const inputScaleY = document.getElementById('input-scale-y');
const inputScaleZ = document.getElementById('input-scale-z');
const inputRotation = document.getElementById('input-rotation');
const labelRotation = document.getElementById('label-rotation');
const selectedItemRoadSection = document.getElementById('selected-item-road-section');
const inputSelectedRoadWidth = document.getElementById('input-selected-road-width');
const btnLockSelected = document.getElementById('btn-lock-selected');


// --- UI Güncelleme Fonksiyonu ---
const updateUI = () => {
    // Top panelleri
    drawingModePanel.classList.toggle('hidden', !(drawingMode && !eraserMode && !measureMode));
    eraserModePanel.classList.toggle('hidden', !eraserMode);
    if (measureModePanel) measureModePanel.classList.toggle('hidden', !measureMode);

    if (drawingMode && selectedId && !eraserMode) {
        const selectedRoad = items.find(i => i.id === selectedId);
        if (selectedRoad && selectedRoad.type === 'road') {
            if (inputRoadWidth && document.activeElement !== inputRoadWidth) {
                inputRoadWidth.value = selectedRoad.width || 1.5;
            }
            if (btnUndoRoad) {
                btnUndoRoad.disabled = !(selectedRoad.points && selectedRoad.points.length > 0);
            }
        }
    }

    // Sidebar Eraser
    if (eraserMode) {
        btnToggleEraser.classList.add('bg-red-500/20', 'border-red-500', 'text-red-400', 'shadow-[0_0_15px_rgba(239,68,68,0.2)]');
        btnToggleEraser.classList.remove('bg-slate-800', 'border-slate-700', 'text-slate-300');
        labelToggleEraser.textContent = 'Fırça Açık';
        eraserSliderContainer.classList.remove('hidden');
    } else {
        btnToggleEraser.classList.remove('bg-red-500/20', 'border-red-500', 'text-red-400', 'shadow-[0_0_15px_rgba(239,68,68,0.2)]');
        btnToggleEraser.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-300');
        labelToggleEraser.textContent = 'Fırçayı Etkinleştir';
        eraserSliderContainer.classList.add('hidden');
    }
    labelEraserSize.textContent = `${eraserSize}m`;

    // Sidebar Beton Toggle
    if (btnToggleGrass) {
        if (grassEnabled) {
            btnToggleGrass.classList.add('bg-emerald-500/20', 'border-emerald-500', 'shadow-[0_0_15px_rgba(16,185,129,0.2)]');
            btnToggleGrass.classList.remove('bg-slate-800', 'border-slate-700');
            if (labelToggleGrass) labelToggleGrass.textContent = 'Beton Açık';
        } else {
            btnToggleGrass.classList.remove('bg-emerald-500/20', 'border-emerald-500', 'shadow-[0_0_15px_rgba(16,185,129,0.2)]');
            btnToggleGrass.classList.add('bg-slate-800', 'border-slate-700');
            if (labelToggleGrass) labelToggleGrass.textContent = 'Beton';
        }
    }

    // Sidebar DXF
    if (dxfData.content) {
        dxfLoadedContainer.classList.remove('hidden');
        dxfUploadContainer.classList.add('hidden');
        labelDxfFilename.textContent = dxfData.filename;
        dxfUnitBtns.forEach(btn => {
            if (btn.dataset.dxfUnit === dxfUnit) {
                btn.classList.add('bg-sky-500/20', 'text-sky-300', 'border-sky-500/50');
                btn.classList.remove('border-slate-700', 'text-slate-400');
            } else {
                btn.classList.remove('bg-sky-500/20', 'text-sky-300', 'border-sky-500/50');
                btn.classList.add('border-slate-700', 'text-slate-400');
            }
        });
    } else {
        dxfLoadedContainer.classList.add('hidden');
        dxfUploadContainer.classList.remove('hidden');
    }

    // Seçili Öğe
    const selectedItem = items.find(i => i.id === selectedId);
    if (selectedId && selectedItem && !eraserMode) {
        selectedItemPanel.classList.remove('hidden');
        selectedItemLabel.textContent = selectedItem.label + (selectedItem.locked ? " 🔒" : "");

        if (btnLockSelected) {
            btnLockSelected.innerHTML = selectedItem.locked ? '<i data-lucide="lock" class="w-4 h-4"></i>' : '<i data-lucide="lock-open" class="w-4 h-4"></i>';
            btnLockSelected.title = selectedItem.locked ? "Kilidi Aç" : "Kilitle";
            if (window.lucide) lucide.createIcons();
        }

        const isLocked = !!selectedItem.locked;
        if (selectedItem.type !== 'road') {
            selectedItemPos.textContent = `Konum: ${selectedItem.position[0].toFixed(2)}m, ${selectedItem.position[2].toFixed(2)}m`;
            selectedItemTransformSection.classList.remove('hidden');
            if (selectedItemRoadSection) selectedItemRoadSection.classList.add('hidden');

            // Scaleler
            const baseSize = objectSizes[selectedId];
            if (baseSize) {
                inputScaleX.value = Math.round(baseSize.x * (selectedItem.scale?.x || 1) * 100);
                inputScaleY.value = Math.round(baseSize.y * (selectedItem.scale?.y || 1) * 100);
                inputScaleZ.value = Math.round(baseSize.z * (selectedItem.scale?.z || 1) * 100);
            } else {
                inputScaleX.value = '';
                inputScaleY.value = '';
                inputScaleZ.value = '';
            }

            inputScaleX.disabled = isLocked;
            inputScaleY.disabled = isLocked;
            inputScaleZ.disabled = isLocked;

            // Rotation
            const rotDeg = Math.round((selectedItem.rotationY || 0) * (180 / Math.PI)) % 360;
            labelRotation.textContent = `${rotDeg}°`;
            inputRotation.value = ((selectedItem.rotationY || 0) * (180 / Math.PI) + 360) % 360;
            inputRotation.disabled = isLocked;

        } else {
            selectedItemPos.textContent = `Nokta Sayısı: ${selectedItem.points?.length || 0}`;
            selectedItemTransformSection.classList.add('hidden');
            if (selectedItemRoadSection) {
                selectedItemRoadSection.classList.remove('hidden');
                if (inputSelectedRoadWidth && document.activeElement !== inputSelectedRoadWidth) {
                    inputSelectedRoadWidth.value = selectedItem.width || 1.5;
                }
                if (inputSelectedRoadWidth) inputSelectedRoadWidth.disabled = isLocked;
            }
        }

        if (selectedItem.type === 'floor') {
            selectedItemColorSection.classList.remove('hidden');
            inputSelectedColor.value = selectedItem.color || '#8b5a2b';
            inputSelectedColor.disabled = isLocked;
            // Show/update grass toggle for floor
            const grassSection = document.getElementById('selected-item-grass-section');
            if (grassSection) {
                grassSection.classList.remove('hidden');
                const grassBtn = document.getElementById('btn-floor-grass');
                if (grassBtn) {
                    if (selectedItem.textureMode === 'grass') {
                        grassBtn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                        grassBtn.classList.remove('border-slate-700', 'text-slate-400');
                        grassBtn.textContent = 'Çim Aktif';
                    } else {
                        grassBtn.classList.remove('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                        grassBtn.classList.add('border-slate-700', 'text-slate-400');
                        grassBtn.textContent = 'Çim Ekle';
                    }
                    grassBtn.disabled = isLocked;
                }
            }
        } else {
            selectedItemColorSection.classList.add('hidden');
            const grassSection = document.getElementById('selected-item-grass-section');
            if (grassSection) grassSection.classList.add('hidden');
        }
    } else {
        selectedItemPanel.classList.add('hidden');
    }

    // Sol panel listesini güncelle
    if (itemsListContainer) {
        itemsListContainer.innerHTML = '';
        if (items.length === 0) {
            itemsListContainer.innerHTML = '<span class="text-[10px] text-slate-500 italic">Henüz sahneye hiç obje eklenmedi.</span>';
        } else {
            items.forEach(item => {
                const itemBtn = document.createElement('button');
                itemBtn.className = `p-2 rounded flex justify-between items-center text-xs transition-colors border ${item.id === selectedId ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50 text-slate-300'}`;
                itemBtn.onclick = () => {
                    if (drawingMode) drawingMode = false;
                    if (eraserMode) eraserMode = false;
                    selectedId = item.id;
                    updateUI();
                };

                const spanName = document.createElement('span');
                spanName.textContent = item.label;
                spanName.className = 'font-bold truncate text-left flex-1';

                const spanType = document.createElement('span');
                spanType.textContent = item.type;
                spanType.className = 'text-[9px] uppercase px-1.5 py-0.5 bg-slate-900 rounded text-slate-400 ml-2';

                itemBtn.appendChild(spanName);
                itemBtn.appendChild(spanType);

                itemsListContainer.appendChild(itemBtn);
            });
        }
    }

    labelItemCount.textContent = items.length;

    // Render Custom Library Section
    if (customLibraryGrid && customLibrarySection) {
        if (customModels.length > 0) {
            customLibrarySection.classList.remove('hidden');
            customLibraryGrid.innerHTML = '';
            customModels.forEach(model => {
                const btn = document.createElement('button');
                btn.className = "flex flex-col items-center relative justify-center p-3 rounded-xl border border-slate-700 bg-slate-800 transition-all active:scale-95 hover:border-blue-500 hover:bg-blue-500/10";

                const iconDiv = document.createElement('div');
                iconDiv.className = "mb-2 text-slate-300";
                iconDiv.innerHTML = '<i data-lucide="package" class="w-5 h-5"></i>';
                btn.appendChild(iconDiv);

                const labelSpan = document.createElement('span');
                labelSpan.className = "text-[10px] font-medium text-center break-words w-full";
                labelSpan.textContent = model.label;
                btn.appendChild(labelSpan);

                btn.onclick = (e) => {
                    // Prevent trigger if del btn is clicked
                    if (e.target.closest('.del-custom-model')) return;
                    if (drawingMode) drawingMode = false;
                    if (eraserMode) eraserMode = false;

                    const newItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'custom_glb',
                        url: model.url,
                        fileData: model.fileData,
                        label: model.label,
                        position: [Math.floor(Math.random() * 6) - 3, 0, Math.floor(Math.random() * 6) - 3],
                        scale: { x: 1, y: 1, z: 1 },
                        rotationY: 0
                    };
                    items.push(newItem);
                    selectedId = newItem.id;
                    updateUI();
                };

                const delBtn = document.createElement('div');
                delBtn.className = "del-custom-model absolute top-1 right-1 p-1 text-slate-500 hover:text-red-400 z-10 transition-colors cursor-pointer rounded-full hover:bg-red-500/20";
                delBtn.innerHTML = '<i data-lucide="x" class="w-3 h-3"></i>';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    customModels = customModels.filter(m => m.id !== model.id);
                    // Also URL revocation might be tricky if items are using it, but they regenerate on reload anyway.
                    updateUI();
                };
                btn.appendChild(delBtn);

                customLibraryGrid.appendChild(btn);
            });
            if (window.lucide) lucide.createIcons();
        } else {
            customLibrarySection.classList.add('hidden');
        }
    }

    idb.set('items', items).catch(() => { });
    idb.set('dxf', dxfData).catch(() => { });
    idb.set('dxfUnit', dxfUnit).catch(() => { });
    idb.set('customModels', customModels).catch(() => { });
};


// --- Three.js Kurulumu ve Animasyon Döngüsü ---
let scene, camera, renderer, controls;
let sceneObjects = new Map();
let interactableObjects = [];
let floorMesh, floorPlane, brushSphereMesh, selectionGizmo, previewRoadSegment, selectionRing, rotationHandle, rotationHandleGroup;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let isDragging = false;
let isRotating = false;
let isErasing = false;
let dragObject = null;
let dragOffset = new THREE.Vector3();
let currentDxfString = null;
let dxfSceneGroup = null;


const initThree = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 5000);
    camera.position.set(12, 12, 12);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    renderer.domElement.style.touchAction = 'none';

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.NONE,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN
    };

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    scene.add(new THREE.PointLight(0xffffff, 0.3));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x0f172a, 0.4));

    const grid = new THREE.GridHelper(2000, 2000, 0x475569, 0x334155);
    grid.name = 'mainGrid';
    scene.add(grid);

    // Generate concrete texture for main floor
    const concreteCanvas = generateConcreteTexture(512);
    concreteTexture = new THREE.CanvasTexture(concreteCanvas);
    concreteTexture.wrapS = THREE.RepeatWrapping;
    concreteTexture.wrapT = THREE.RepeatWrapping;
    concreteTexture.repeat.set(200, 200);
    concreteTexture.encoding = THREE.sRGBEncoding;

    // Generate grass texture for floor plates
    const grassCanvas = generateGrassTexture(256);
    grassFloorTexture = new THREE.CanvasTexture(grassCanvas);
    grassFloorTexture.wrapS = THREE.RepeatWrapping;
    grassFloorTexture.wrapT = THREE.RepeatWrapping;
    grassFloorTexture.repeat.set(2, 2);
    grassFloorTexture.encoding = THREE.sRGBEncoding;

    floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.2 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    brushSphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.8 })
    );
    brushSphereMesh.visible = false;
    scene.add(brushSphereMesh);

    selectionGizmo = new THREE.Group();
    selectionRing = new THREE.Mesh(
        new THREE.RingGeometry(1, 1.1, 32),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.06;
    selectionGizmo.add(selectionRing);

    rotationHandleGroup = new THREE.Group();
    rotationHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    rotationHandle.position.set(0, 0.06, 0);
    rotationHandleGroup.add(rotationHandle);
    selectionGizmo.add(rotationHandleGroup);

    selectionGizmo.visible = false;
    scene.add(selectionGizmo);

    previewRoadSegment = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.06, 1),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 })
    );
    previewRoadSegment.visible = false;
    scene.add(previewRoadSegment);

    previewMeasureLine = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2, depthTest: false })
    );
    previewMeasureLine.renderOrder = 999;
    previewMeasureLine.visible = false;
    scene.add(previewMeasureLine);

    // Olay Dinleyicileri
    const element = renderer.domElement;
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Ana Dongu
    renderer.setAnimationLoop(animate);
    updateUI();
};

const playbackStrokes = (item, rootObj) => {
    if (!item.erasedStrokes || item.erasedStrokes.length === 0) return;

    rootObj.updateMatrixWorld(true);

    item.erasedStrokes.forEach(stroke => {
        const localP = new THREE.Vector3(...stroke.p);
        const hitPointWorld = rootObj.localToWorld(localP);
        const radius = stroke.r;
        const brushBox = new THREE.Box3().setFromCenterAndSize(
            hitPointWorld,
            new THREE.Vector3(radius * 2, radius * 2, radius * 2)
        );

        const traverseAndErase = (obj) => {
            if (!obj.visible) return;
            if (obj.isMesh || obj.isLine || obj.isLineSegments) {
                if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
                const worldBox = obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld);
                if (worldBox.intersectsBox(brushBox)) {
                    applyEraserBrushToGeometry(hitPointWorld, obj, radius);
                }
            }
            if (obj.children) obj.children.forEach(traverseAndErase);
        };
        traverseAndErase(rootObj);
    });
};

const syncObjects = () => {
    const currentIds = new Set(items.map(i => i.id));
    for (const [id, obj] of sceneObjects.entries()) {
        if (!currentIds.has(id)) {
            scene.remove(obj);
            sceneObjects.delete(id);
            const index = interactableObjects.indexOf(obj);
            if (index > -1) interactableObjects.splice(index, 1);
        }
    }

    items.forEach(item => {
        if (item.type === 'measure') {
            if (!sceneObjects.has(item.id)) {
                const p1 = new THREE.Vector3(...item.start);
                const p2 = new THREE.Vector3(...item.end);
                const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
                const mat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2, depthTest: false });
                const line = new THREE.LineSegments(geom, mat);
                line.userData.id = item.id;
                line.userData.isMeasure = true;
                line.renderOrder = 998;
                line.position.set(item.position[0], 0, item.position[2]);
                scene.add(line);
                sceneObjects.set(item.id, line);
                interactableObjects.push(line);
            } else {
                const line = sceneObjects.get(item.id);
                if (!isDragging || dragObject?.userData.id !== item.id) {
                    line.position.set(item.position[0], 0, item.position[2]);
                }
            }
        } else if (item.type === 'road') {
            const existingObj = sceneObjects.get(item.id);
            const pointsStr = JSON.stringify(item.points);
            const rWidth = item.width || 1.5;

            if (existingObj && (existingObj.userData.pointsStr !== pointsStr || existingObj.userData.rWidth !== rWidth)) {
                scene.remove(existingObj);
                sceneObjects.delete(item.id);
                const idx = interactableObjects.indexOf(existingObj);
                if (idx > -1) interactableObjects.splice(idx, 1);
            }

            if (!sceneObjects.has(item.id)) {
                const roadGroup = buildRoadGroup(item);
                roadGroup.userData.id = item.id;
                roadGroup.userData.isRoad = true;
                roadGroup.userData.pointsStr = pointsStr;
                roadGroup.userData.rWidth = rWidth;
                scene.add(roadGroup);
                sceneObjects.set(item.id, roadGroup);
                interactableObjects.push(roadGroup);
                playbackStrokes(item, roadGroup);
            }
        } else {
            if (!sceneObjects.has(item.id)) {
                let obj;
                if (item.type === 'custom_glb' || item.type === 'predefined_glb') {
                    obj = createModel(item, (loadedGroup) => {
                        const box = new THREE.Box3().setFromObject(loadedGroup);
                        const size = new THREE.Vector3();
                        box.getSize(size);
                        loadedGroup.userData.baseSize = size;
                        objectSizes[item.id] = { x: size.x, y: size.y, z: size.z };
                        playbackStrokes(item, loadedGroup);
                        updateUI();
                    });
                } else {
                    obj = createModel(item);
                    const box = new THREE.Box3().setFromObject(obj);
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    obj.userData.baseSize = size;
                    objectSizes[item.id] = { x: size.x, y: size.y, z: size.z };
                    updateUI();
                }

                obj.userData.id = item.id;
                obj.position.set(item.position[0], item.position[1], item.position[2]);
                if (item.scale) obj.scale.set(item.scale.x, item.scale.y, item.scale.z);
                if (item.rotationY) obj.rotation.y = item.rotationY;

                if (item.type === 'floor') {
                    obj.userData.textureMode = item.textureMode || null;
                }

                scene.add(obj);
                sceneObjects.set(item.id, obj);
                interactableObjects.push(obj);

                if (item.type !== 'custom_glb') {
                    playbackStrokes(item, obj);
                }
            } else {
                const obj = sceneObjects.get(item.id);
                if (!isDragging && !isRotating || dragObject?.userData.id !== item.id) {
                    obj.position.set(item.position[0], item.position[1], item.position[2]);
                    if (item.rotationY !== undefined) obj.rotation.y = item.rotationY;
                }
                if (item.scale) {
                    obj.scale.set(item.scale.x, item.scale.y, item.scale.z);
                }

                // Update grass texture repeat based on scale
                if (item.type === 'floor' && item.textureMode === 'grass') {
                    obj.traverse(child => {
                        if (child.isMesh && child.material && child.material.map) {
                            const sx = item.scale?.x || 1;
                            const sz = item.scale?.z || 1;
                            child.material.map.repeat.set(2 * sx, 2 * sz);
                        }
                    });
                }

                if (item.type === 'floor') {
                    // Check if textureMode changed, if so rebuild
                    const currentTexMode = obj.userData.textureMode || null;
                    if (currentTexMode !== (item.textureMode || null)) {
                        scene.remove(obj);
                        sceneObjects.delete(item.id);
                        const idx = interactableObjects.indexOf(obj);
                        if (idx > -1) interactableObjects.splice(idx, 1);
                        return; // will be recreated next frame
                    }
                }

                if (item.color && item.type === 'floor' && !item.textureMode) {
                    obj.traverse(child => {
                        if (child.isMesh && child.material) {
                            child.material.color.set(item.color);
                        }
                    });
                }
            }
        }
    });

    if (dxfData.content !== currentDxfString) {
        currentDxfString = dxfData.content;
        if (dxfSceneGroup) {
            scene.remove(dxfSceneGroup);
            dxfSceneGroup = null;
        }
        if (currentDxfString) {
            dxfSceneGroup = parseDXFToGroup(currentDxfString);
            scene.add(dxfSceneGroup);
        }
    }
    if (dxfSceneGroup) {
        const scale = dxfUnit === 'mm' ? 0.001 : (dxfUnit === 'cm' ? 0.01 : 1);
        dxfSceneGroup.scale.setScalar(scale);
    }
};

const runVolumetricEraser = (hitPointWorld) => {
    const radius = eraserSize;
    const brushBox = new THREE.Box3().setFromCenterAndSize(
        hitPointWorld,
        new THREE.Vector3(radius * 2, radius * 2, radius * 2)
    );

    interactableObjects.forEach(rootObj => {
        let hitItem = false;
        const traverseAndErase = (obj) => {
            if (!obj.visible) return;
            if (obj.isMesh || obj.isLine || obj.isLineSegments) {
                if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
                const worldBox = obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld);
                if (worldBox.intersectsBox(brushBox)) {
                    applyEraserBrushToGeometry(hitPointWorld, obj, radius);
                    hitItem = true;
                }
            }
            if (obj.children) {
                obj.children.forEach(traverseAndErase);
            }
        };
        traverseAndErase(rootObj);

        if (hitItem && rootObj.userData.id) {
            const item = items.find(i => i.id === rootObj.userData.id);
            if (item) {
                const localP = rootObj.worldToLocal(hitPointWorld.clone());
                item.erasedStrokes = item.erasedStrokes || [];
                item.erasedStrokes.push({ p: [localP.x, localP.y, localP.z], r: radius });
            }
        }
    });

    if (dxfSceneGroup) {
        const traverseAndEraseDxf = (obj) => {
            if (!obj.visible) return;
            if (obj.isMesh || obj.isLine || obj.isLineSegments) {
                if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
                const worldBox = obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld);
                if (worldBox.intersectsBox(brushBox)) {
                    applyEraserBrushToGeometry(hitPointWorld, obj, radius);
                }
            }
            if (obj.children) {
                obj.children.forEach(traverseAndEraseDxf);
            }
        };
        traverseAndEraseDxf(dxfSceneGroup);
    }
};

const handlePointerDown = (e) => {
    if (e.button !== 0) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (measureMode) {
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(floorPlane, intersectPoint);
        if (!currentMeasureStart) {
            currentMeasureStart = [intersectPoint.x, 0.05, intersectPoint.z];
            if (measureInfoText) measureInfoText.textContent = "Bitiş noktasına tıklayın...";
        } else {
            const endPoint = [intersectPoint.x, 0.05, intersectPoint.z];
            saveState(); // state hook
            items.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'measure',
                label: 'Mesafe Ölçümü',
                start: currentMeasureStart,
                end: endPoint,
                position: [0, 0, 0],
                scale: { x: 1, y: 1, z: 1 },
                rotationY: 0
            });
            currentMeasureStart = null;
            if (measureInfoText) measureInfoText.textContent = "Başlangıç noktasına tıklayın...";
            updateUI();
        }
        return;
    }

    if (eraserMode) {
        isErasing = true;
        controls.enabled = false;

        const targets = [...interactableObjects, floorMesh];
        if (dxfSceneGroup) targets.push(dxfSceneGroup);
        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
            runVolumetricEraser(intersects[0].point);
        }
        return;
    }

    if (drawingMode) {
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(floorPlane, intersectPoint);
        const preciseX = intersectPoint.x;
        const preciseZ = intersectPoint.z;

        items = items.map(item => {
            if (item.id === selectedId && item.type === 'road') {
                const pts = item.points || [];
                if (pts.length > 0 && pts[pts.length - 1][0] === preciseX && pts[pts.length - 1][1] === preciseZ) {
                    return item;
                }
                saveState(); // state hook for adding road node
                return { ...item, points: [...pts, [preciseX, preciseZ]] };
            }
            return item;
        });
        updateUI();
        return;
    }

    if (selectionGizmo.visible && rotationHandle.visible) {
        const handleIntersects = raycaster.intersectObject(rotationHandle);
        if (handleIntersects.length > 0) {
            const item = items.find(i => i.id === selectedId);
            if (item && !item.locked) {
                saveState(); // state hook before rotating
                isRotating = true;
                dragObject = sceneObjects.get(selectedId);
                controls.enabled = false;
                renderer.domElement.style.cursor = 'ew-resize';
            }
            return;
        }
    }

    const intersects = raycaster.intersectObjects(interactableObjects, true);
    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.id) {
            obj = obj.parent;
        }
        if (obj && obj.userData.id) {
            selectedId = obj.userData.id;
            const item = items.find(i => i.id === selectedId);

            if (item && !item.locked) {
                saveState(); // state hook before dragging
                isDragging = true;
                dragObject = obj;
                controls.enabled = false;
                renderer.domElement.style.cursor = 'grabbing';

                const planeIntersect = new THREE.Vector3();
                raycaster.ray.intersectPlane(floorPlane, planeIntersect);
                dragOffset.subVectors(obj.position, planeIntersect);
            }
            updateUI();
            return;
        }
    }

    selectedId = null;
    updateUI();
};

const handlePointerMove = (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (eraserMode) {
        renderer.domElement.style.cursor = 'none';

        const targets = [...interactableObjects, floorMesh];
        if (dxfSceneGroup) targets.push(dxfSceneGroup);
        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            brushSphereMesh.position.copy(hitPoint);
            brushSphereMesh.scale.setScalar(eraserSize);
            brushSphereMesh.visible = true;

            if (isErasing) {
                runVolumetricEraser(hitPoint);
            }
        } else {
            brushSphereMesh.visible = false;
        }
        return;
    } else {
        brushSphereMesh.visible = false;
    }

    if (measureMode && currentMeasureStart) {
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(floorPlane, intersectPoint);
        const p1 = new THREE.Vector3(currentMeasureStart[0], 0.05, currentMeasureStart[2]);
        const p2 = new THREE.Vector3(intersectPoint.x, 0.05, intersectPoint.z);
        previewMeasureLine.geometry.setFromPoints([p1, p2]);
        previewMeasureLine.visible = true;
        currentMeasureP2 = [p2.x, p2.y, p2.z];
    } else {
        if (previewMeasureLine) previewMeasureLine.visible = false;
        currentMeasureP2 = null;
    }

    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectPoint);

    if (isRotating && dragObject) {
        const angle = Math.atan2(intersectPoint.x - dragObject.position.x, intersectPoint.z - dragObject.position.z);
        dragObject.rotation.y = angle;
        // Gorsel olarak donmeyi hemen goster ama store a up'ta at:
        // Yada store a surekli senkronize et
        items = items.map(item => item.id === dragObject.userData.id ? { ...item, rotationY: angle } : item);
        updateUI();
    } else if (isDragging && dragObject) {
        const newPosX = intersectPoint.x + dragOffset.x;
        const newPosZ = intersectPoint.z + dragOffset.z;
        dragObject.position.set(newPosX, 0, newPosZ);
        items = items.map(item => item.id === dragObject.userData.id ? { ...item, position: [newPosX, 0, newPosZ] } : item);
        updateUI();
    } else if (measureMode) {
        renderer.domElement.style.cursor = 'crosshair';
    } else if (!drawingMode) {
        const intersects = raycaster.intersectObjects(interactableObjects, true);
        renderer.domElement.style.cursor = intersects.length > 0 ? 'grab' : ((controls && controls.state !== -1) ? 'move' : 'auto');
    }
};

const handlePointerUp = (e) => {
    if (e.button !== 0) return;

    if (eraserMode) {
        if (isErasing) {
            updateUI(); // Yapılan silme işlemlerini (strokes) kaydet
        }
        isErasing = false;
        controls.enabled = true;
        return;
    }

    isDragging = false;
    isRotating = false;
    dragObject = null;
    controls.enabled = true;
    renderer.domElement.style.cursor = drawingMode ? 'crosshair' : 'auto';
};

const animate = () => {
    syncObjects();
    controls.update();

    if (selectedId && sceneObjects.has(selectedId) && !eraserMode) {
        const obj = sceneObjects.get(selectedId);

        if (obj.userData.isRoad) {
            selectionGizmo.visible = false;
        } else {
            selectionGizmo.position.copy(obj.position);
            selectionGizmo.rotation.y = obj.rotation.y;

            const baseSize = obj.userData.baseSize;
            let radius = 1;
            if (baseSize) {
                const dimX = baseSize.x * obj.scale.x;
                const dimZ = baseSize.z * obj.scale.z;
                radius = Math.max(dimX, dimZ) / 2 + 0.3;
            }

            selectionRing.scale.setScalar(radius);
            rotationHandleGroup.position.set(0, 0, radius + 0.4);
            selectionGizmo.visible = true;
        }
    } else {
        selectionGizmo.visible = false;
    }

    if (drawingMode && selectedId && !eraserMode) {
        const road = items.find(i => i.id === selectedId);
        if (road && road.points && road.points.length > 0) {
            raycaster.setFromCamera(mouse, camera);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(floorPlane, intersectPoint);

            const preciseX = intersectPoint.x;
            const preciseZ = intersectPoint.z;

            const lastP = road.points[road.points.length - 1];
            const dx = preciseX - lastP[0];
            const dz = preciseZ - lastP[1];
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 0) {
                const angle = Math.atan2(dx, dz);
                const rWidth = road.width || 1.5;
                previewRoadSegment.scale.set(rWidth, 1, dist + rWidth);
                previewRoadSegment.position.set(lastP[0] + dx / 2, 0.03, lastP[1] + dz / 2);
                previewRoadSegment.rotation.y = angle;
                previewRoadSegment.visible = true;
            } else {
                previewRoadSegment.visible = false;
            }
        } else {
            previewRoadSegment.visible = false;
        }
    } else {
        previewRoadSegment.visible = false;
    }

    renderer.render(scene, camera);

    // -- 3D Mesafe Etiketlerini Güncelle --
    if (labelsContainer) {
        labelsContainer.innerHTML = '';
        const rect = renderer.domElement.getBoundingClientRect();

        items.forEach(item => {
            if (item.type !== 'measure') return;
            const p1 = new THREE.Vector3(item.start[0] + item.position[0], item.start[1], item.start[2] + item.position[2]);
            const p2 = new THREE.Vector3(item.end[0] + item.position[0], item.end[1], item.end[2] + item.position[2]);
            const dist = p1.distanceTo(p2);
            const mid = p1.clone().add(p2).multiplyScalar(0.5);
            mid.project(camera);
            const x = (mid.x * 0.5 + 0.5) * rect.width + rect.left;
            const y = (-mid.y * 0.5 + 0.5) * rect.height + rect.top;
            if (mid.z > 1) return; // behind camera
            const label = document.createElement('div');
            label.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);background:rgba(245,158,11,0.9);color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;pointer-events:none;`;
            label.textContent = dist.toFixed(2) + ' m';
            labelsContainer.appendChild(label);
        });

        // Preview ölçüm etiketi
        if (measureMode && currentMeasureStart && currentMeasureP2) {
            const p1 = new THREE.Vector3(...currentMeasureStart);
            const p2 = new THREE.Vector3(...currentMeasureP2);
            const dist = p1.distanceTo(p2);
            const mid = p1.clone().add(p2).multiplyScalar(0.5);
            mid.project(camera);
            const x = (mid.x * 0.5 + 0.5) * rect.width + rect.left;
            const y = (-mid.y * 0.5 + 0.5) * rect.height + rect.top;
            if (mid.z <= 1) {
                const label = document.createElement('div');
                label.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-150%);background:rgba(245,158,11,0.7);color:#fff;padding:2px 8px;border-radius:8px;font-size:13px;font-weight:700;white-space:nowrap;pointer-events:none;border:1px dashed rgba(255,255,255,0.5);`;
                label.textContent = dist.toFixed(2) + ' m';
                labelsContainer.appendChild(label);
            }
        }
    }
};


// --- UI Etkileşim Dinleyicileri ---

btnEndDrawing.addEventListener('click', () => {
    drawingMode = false;
    items = items.filter(i => !(i.type === 'road' && (!i.points || i.points.length === 0)));
    updateUI();
});

if (btnLockSelected) {
    btnLockSelected.addEventListener('click', () => {
        if (selectedId) {
            items = items.map(item => item.id === selectedId ? { ...item, locked: !item.locked } : item);
            updateUI();
        }
    });
}

btnEndEraser.addEventListener('click', () => {
    eraserMode = false;
    updateUI();
});

btnToggleEraser.addEventListener('click', () => {
    eraserMode = !eraserMode;
    if (!eraserMode) {
        drawingMode = false;
        selectedId = null;
    }
    updateUI();
});

if (btnToggleGrass) {
    btnToggleGrass.addEventListener('click', () => {
        grassEnabled = !grassEnabled;
        toggleConcrete(grassEnabled);
        idb.set('grassEnabled', grassEnabled).catch(() => { });
        updateUI();
    });
}

inputEraserSize.addEventListener('input', (e) => {
    eraserSize = Number(e.target.value);
    updateUI();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (drawingMode) {
            drawingMode = false;
            items = items.filter(i => !(i.type === 'road' && (!i.points || i.points.length === 0)));
        }
        if (eraserMode) eraserMode = false;
        if (measureMode) {
            measureMode = false;
            currentMeasureStart = null;
            if (previewMeasureLine) previewMeasureLine.visible = false;
        }
        updateUI();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoAction();
    }
});

document.querySelectorAll('[data-add-type]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (drawingMode) drawingMode = false;
        if (eraserMode) eraserMode = false;

        const type = btn.dataset.addType;
        const label = btn.dataset.addLabel;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label,
            url: btn.dataset.url, // Yalnızca predefined_glb'ler için var olacak
            position: [Math.floor(Math.random() * 6) - 3, 0, Math.floor(Math.random() * 6) - 3],
            scale: { x: 1, y: 1, z: 1 },
            rotationY: 0,
            color: type === 'floor' ? '#8b5a2b' : undefined
        };
        saveState();
        items.push(newItem);
        selectedId = newItem.id;
        updateUI();
    });
});


if (btnUndoRoad) {
    btnUndoRoad.addEventListener('click', () => {
        if (drawingMode && selectedId) {
            items = items.map(item => {
                if (item.id === selectedId && item.type === 'road' && item.points && item.points.length > 0) {
                    return { ...item, points: item.points.slice(0, -1) };
                }
                return item;
            });
            updateUI();
        }
    });
}

if (inputRoadWidth) {
    inputRoadWidth.addEventListener('input', (e) => {
        if (drawingMode && selectedId) {
            const val = Number(e.target.value);
            if (val > 0) {
                items = items.map(item => {
                    if (item.id === selectedId && item.type === 'road') {
                        return { ...item, width: val };
                    }
                    return item;
                });
                updateUI();
            }
        }
    });
}

if (inputSelectedRoadWidth) {
    inputSelectedRoadWidth.addEventListener('input', (e) => {
        if (selectedId) {
            const val = Number(e.target.value);
            if (val > 0) {
                items = items.map(item => {
                    if (item.id === selectedId && item.type === 'road') {
                        return { ...item, width: val };
                    }
                    return item;
                });
                updateUI();
            }
        }
    });
}

btnAddRoad.addEventListener('click', () => {
    if (eraserMode) eraserMode = false;
    if (measureMode) { measureMode = false; currentMeasureStart = null; }
    saveState();
    const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'road',
        label: 'Yol / Patika',
        points: [],
        width: inputRoadWidth ? (Number(inputRoadWidth.value) || 1.5) : 1.5
    };
    items.push(newItem);
    selectedId = newItem.id;
    drawingMode = true;
    updateUI();
});

// -- Measure Mode Listeners --
if (btnMeasure) {
    btnMeasure.addEventListener('click', () => {
        if (drawingMode) drawingMode = false;
        if (eraserMode) eraserMode = false;
        measureMode = !measureMode;
        currentMeasureStart = null;
        if (measureInfoText) measureInfoText.textContent = "Ba\u015flang\u0131\u00e7 noktas\u0131na t\u0131klay\u0131n...";
        updateUI();
    });
}
if (btnEndMeasure) {
    btnEndMeasure.addEventListener('click', () => {
        measureMode = false;
        currentMeasureStart = null;
        if (previewMeasureLine) previewMeasureLine.visible = false;
        updateUI();
    });
}

btnUploadGlb.addEventListener('click', () => inputGlbUpload.click());

inputGlbUpload.addEventListener('change', (e) => {
    if (drawingMode) drawingMode = false;
    if (eraserMode) eraserMode = false;

    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const label = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;

    const newModel = {
        id: Math.random().toString(36).substr(2, 9),
        fileData: file,
        url: url,
        label: label
    };

    customModels.push(newModel);
    e.target.value = '';
    updateUI();
});

btnUploadDxf.addEventListener('click', () => inputDxfUpload.click());
inputDxfUpload.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        dxfData = {
            content: event.target.result,
            filename: file.name
        };
        dxfUnit = 'm';
        e.target.value = '';
        updateUI();
    };
    reader.readAsText(file);
});

btnRemoveDxf.addEventListener('click', () => {
    dxfData = { content: null, filename: null };
    updateUI();
});

dxfUnitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dxfUnit = btn.dataset.dxfUnit;
        updateUI();
    });
});

btnDeleteSelected.addEventListener('click', () => {
    if (!selectedId) return;
    saveState();
    const id = selectedId;
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete?.type === 'custom_glb' && itemToDelete.url) {
        URL.revokeObjectURL(itemToDelete.url);
    }
    items = items.filter(item => item.id !== id);
    if (selectedId === id) {
        selectedId = null;
        if (itemToDelete?.type === 'road') drawingMode = false;
    }
    updateUI();
});

inputSelectedColor.addEventListener('input', (e) => {
    if (selectedId) {
        items = items.map(i => i.id === selectedId ? { ...i, color: e.target.value, textureMode: null } : i);
        updateUI();
    }
});

// Floor grass texture toggle
const btnFloorGrass = document.getElementById('btn-floor-grass');
if (btnFloorGrass) {
    btnFloorGrass.addEventListener('click', () => {
        if (!selectedId) return;
        const item = items.find(i => i.id === selectedId);
        if (!item || item.type !== 'floor' || item.locked) return;
        const newMode = item.textureMode === 'grass' ? null : 'grass';
        items = items.map(i => i.id === selectedId ? { ...i, textureMode: newMode } : i);
        updateUI();
    });
}

const handleDimensionChange = (axis, valueInCm) => {
    if (!selectedId) return;
    const baseSize = objectSizes[selectedId];
    if (!baseSize || baseSize[axis] === 0 || valueInCm <= 0) return;

    const newScaleValue = (valueInCm / 100) / baseSize[axis];

    items = items.map(item => {
        if (item.id === selectedId) {
            return { ...item, scale: { ...(item.scale || { x: 1, y: 1, z: 1 }), [axis]: newScaleValue } };
        }
        return item;
    });
    updateUI();
};

inputScaleX.addEventListener('change', (e) => handleDimensionChange('x', Number(e.target.value)));
inputScaleY.addEventListener('change', (e) => handleDimensionChange('y', Number(e.target.value)));
inputScaleZ.addEventListener('change', (e) => handleDimensionChange('z', Number(e.target.value)));

inputRotation.addEventListener('input', (e) => {
    if (selectedId) {
        items = items.map(i => i.id === selectedId ? { ...i, rotationY: Number(e.target.value) * (Math.PI / 180) } : i);
        updateUI();
    }
});

btnReset.addEventListener('click', () => {
    items.forEach(item => {
        if (item.type === 'custom_glb') URL.revokeObjectURL(item.url);
    });
    items = [];
    selectedId = null;
    drawingMode = false;
    eraserMode = false;
    dxfData = { content: null, filename: null };
    updateUI();
});

// Init on load
(async () => {
    try {
        await idb.init();

        const savedItems = await idb.get('items');
        if (savedItems && Array.isArray(savedItems) && savedItems.length > 0) {
            items = savedItems;
            // custom_glb: fileData'dan yeni blob URL oluştur
            items.forEach(item => {
                if (item.type === 'custom_glb' && item.fileData) {
                    if (item.url) try { URL.revokeObjectURL(item.url); } catch (e) { }
                    item.url = URL.createObjectURL(item.fileData);
                }
            });
            // Geçersiz blob: URL'li item'ları temizle (fileData olmayan custom_glb'ler)
            items = items.filter(item => {
                if (item.type === 'custom_glb' && !item.fileData && item.url && item.url.startsWith('blob:')) {
                    return false; // Geçersiz blob URL, kaldır
                }
                return true;
            });
        } else {
            items = [...defaultItems];
        }

        const savedDxf = await idb.get('dxf');
        if (savedDxf && savedDxf.content) dxfData = savedDxf;

        const savedUnit = await idb.get('dxfUnit');
        if (savedUnit) dxfUnit = savedUnit;

        const savedCustomModels = await idb.get('customModels');
        if (savedCustomModels && Array.isArray(savedCustomModels)) {
            customModels = savedCustomModels;
            customModels.forEach(model => {
                if (model.fileData) {
                    if (model.url) try { URL.revokeObjectURL(model.url); } catch (e) { }
                    model.url = URL.createObjectURL(model.fileData);
                }
            });
            // Geçersiz blob URL'li modelleri temizle
            customModels = customModels.filter(m => {
                if (!m.fileData && m.url && m.url.startsWith('blob:')) return false;
                return true;
            });
        }
    } catch (e) {
        console.error('Init yükleme hatası:', e);
        items = [...defaultItems];
    }

    const savedGrass = await idb.get('grassEnabled');
    if (savedGrass) grassEnabled = savedGrass;

    initThree();

    // Apply concrete after initThree if was saved on
    if (grassEnabled) {
        toggleConcrete(true);
    }
})();
