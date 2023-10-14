import * as THREE from 'three';

export function checkIntersection(object1,object2){
    // Check for intersection using bounding box intersection test
    let bBox1 = new THREE.Box3().setFromObject(object1);
    let bBox2 = new THREE.Box3().setFromObject(object2);

    return bBox1.intersectsBox(bBox2);
}