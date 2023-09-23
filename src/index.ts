import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    mobileAndTabletCheck,
    BloomPlugin,
    DiamondPlugin,
    Vector3, GammaCorrectionPlugin, MeshBasicMaterial2, Color, AssetImporter, CameraViewPlugin, ScrollableCameraViewPlugin
} from "webgi";

import "./css/style.min.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
    duration: 4,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical', 
    gestureDirection: 'vertical', 
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
} as any)

lenis.stop()

function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", function() {

    async function setupViewer(){
        const viewer = new ViewerApp({
            canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
            isAntialiased: true,
        })

        const manager = await viewer.addPlugin(AssetManagerPlugin)
        const camera = viewer.scene.activeCamera

        await viewer.addPlugin(GBufferPlugin)
        await viewer.addPlugin(new ProgressivePlugin(32))
        await viewer.addPlugin(new TonemapPlugin(true))
        await viewer.addPlugin(GammaCorrectionPlugin)
        await viewer.addPlugin(SSRPlugin)
        await viewer.addPlugin(SSAOPlugin)
        await viewer.addPlugin(BloomPlugin)
        await viewer.addPlugin(DiamondPlugin)
        await viewer.addPlugin(CameraViewPlugin)
        const scroller = await viewer.addPlugin(ScrollableCameraViewPlugin)

        const camViewPlugin = viewer.getPlugin(CameraViewPlugin)

        let cameraView = (camViewPlugin as any)._cameraViews

        // Loader
        const importer = manager.importer as AssetImporter

        importer.addEventListener("onProgress", (ev) => {
            const progressRatio = (ev.loaded / ev.total)
            document.querySelector('.progress')?.setAttribute('style', `transform: scaleX(${progressRatio})`)
        })

        importer.addEventListener("onLoad", (ev) => {
            gsap.to('.loader', {x: '100%', duration: 0.8, ease: 'power4.inOut', delay: 1, onComplete: () =>{
                lenis.start()
                /* cameraView[1].position = new Vector3(4.10, -2.02, 4.96)
                cameraView[1].target = new Vector3(-0.05, -0.07, 0.17) */
            }})
        })

        viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})

        viewer.renderer.refreshPipeline()

        await viewer.load("./assets/watch.glb")
        let needsUpdate = true

        onUpdate()

        function onUpdate() {
            needsUpdate = true
            viewer.setDirty()
        }

        viewer.addEventListener('preFrame', () =>{
            if(needsUpdate){
                camera.positionTargetUpdated(true)
                needsUpdate = false
            }
        })

        const exploreView = document.querySelector(".explore") as HTMLElement | null;
        const canvasView = document.getElementById("webgi-canvas") as HTMLElement | null;
        const canvasContainer = document.getElementById("webgi-canvas-container") as HTMLElement | null;
        const header = document.querySelector(".header") as HTMLElement | null;
        const exitContainer = document.querySelector(".exit--container") as HTMLElement | null;
        const bodyButton = document.querySelector(".button--body") as HTMLElement | null;

        // EXPLORE ALL FEATURES EVENT
        document.querySelector(".button-explore")?.addEventListener("click", () => {
            exploreView?.style.setProperty('pointer-events', "none");
            exitContainer?.style.setProperty('opacity', "100");
            exitContainer?.style.setProperty('display', "flex");
            canvasView?.style.setProperty('pointer-events', "all");
            canvasContainer?.style.setProperty('z-index', "1");
            header?.style.setProperty('position', "fixed");
            document.body.style.overflowY = "hidden";
            document.body.style.cursor = "grab";
            scroller.enabled = false;

            // Assuming CameraViewPlugin type exists
            let cameraViews = viewer.getPlugin(CameraViewPlugin);
            cameraViews?.animateToView(cameraViews.camViews[4] ?? null);
        });

    }

    setupViewer()

});
