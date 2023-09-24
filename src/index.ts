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

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
    ease: "power3.inOut",
    duration: 1,
});

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

        // Loader
        const importer = manager.importer as AssetImporter

        importer.addEventListener("onProgress", (ev) => {
            const progressRatio = (ev.loaded / ev.total)
            document.querySelector('.progress')?.setAttribute('style', `transform: scaleX(${progressRatio})`)
        })

        importer.addEventListener("onLoad", (ev) => {
            gsap.to('.loader', {x: '100%', duration: 0.8, ease: 'power4.inOut', delay: 1, onComplete: () =>{
                lenis.start()
            }})
        })

        viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})

        viewer.renderer.refreshPipeline()

        await manager.addFromPath("./assets/watch.glb")

        let needsUpdate = true

        onUpdate()

        function onUpdate() {
            needsUpdate = true
            viewer.setDirty()
        }

        viewer.addEventListener('preFrame', () =>{
            if(needsUpdate){
                camera.positionUpdated(true);
                camera.targetUpdated(true);
                needsUpdate = false
            }
        })

        const exploreView = document.querySelector(".explore") as HTMLElement;
        const canvasView = document.getElementById("webgi-canvas") as HTMLElement;
        const canvasContainer = document.getElementById("webgi-canvas-container") as HTMLElement;
        const customizeBottom = document.querySelector(".customize-bottom") as HTMLElement;
        const customizebuttonStart = document.querySelector(".explore__btn") as HTMLElement;
        const btnStyleSilver = document.querySelector("#style-silver") as HTMLElement;
        const btnStyleGold = document.querySelector("#style-gold") as HTMLElement;
        const watchMaterialMain = manager.materials!.findMaterialsByName('meetal')[0] as MeshBasicMaterial2
        const watchMaterialChrome = manager.materials!.findMaterialsByName('chrome')[0] as MeshBasicMaterial2
        const watchMaterial2 = manager.materials!.findMaterialsByName('meetal.002')[0] as MeshBasicMaterial2
        const watchMaterial3 = manager.materials!.findMaterialsByName('meetal.001')[0] as MeshBasicMaterial2

        let cameraViews = viewer.getPlugin(CameraViewPlugin);
        let view = (cameraViews as any)._cameraViews;

        function changeStyle(style: string, e: any = null) {
            watchMaterialMain.color = new Color(style);
            watchMaterialChrome.color = new Color(style);
            watchMaterial2.color = new Color(style);
            watchMaterial3.color = new Color(style);
            document.querySelectorAll(".customize-nav__item")?.forEach((item) => {
                item.classList.remove("active");
            });
            e?.target.classList.add("active");
            onUpdate();
        }

        // STYLES EVENT
        btnStyleSilver?.addEventListener("click", (e) => {
            changeStyle("#e4e5e7", e);
        });

        btnStyleGold?.addEventListener("click", (e) => {
            changeStyle("#f7d78c", e);
        });

        // EXPLORE ALL FEATURES EVENT
        document.querySelector(".explore__btn")?.addEventListener("click", () => {
            exploreView.style.setProperty('pointer-events', "none");
            customizebuttonStart.style.setProperty('pointer-events', "none");
            canvasView.style.setProperty('pointer-events', "all");
            customizeBottom?.style.setProperty('pointer-events', "all");
            canvasContainer?.style.setProperty('z-index', "1");
            document.body.style.cursor = "grab";
            scroller.enabled = false;

            view[3].position = new Vector3(11.64, 2.98, 0.17)
            view[3].target = new Vector3(-0.11, -0.00, -0.00)

            lenis.stop()

            gsap.to('.explore__text', {x: '-100vw'})
            gsap.to('.customize-nav', {right: 0})
            gsap.to('.explore__btn', {yPercent: 110})
            gsap.to('.customize-bottom', {opacity: 1, delay: 1})
            gsap.to('.explore__bottom--text', {opacity: 1, delay: 1.2})

            cameraViews?.animateToView(view[3]);
        });

        document.querySelector(".explore__btn--exit")?.addEventListener("click", () => {
            exploreView.style.pointerEvents = "all";
            customizebuttonStart.style.pointerEvents = "all";
            canvasView.style.pointerEvents = "none";
            customizeBottom.style.pointerEvents = "none";
            canvasContainer.style.zIndex = "unset";
            document.body.style.cursor = "auto";

            view[3].position = new Vector3(7.248, 2.554, -6.159)
            view[3].target = new Vector3(1.443, -0.376, 1.159)

            lenis.start()

            gsap.to('.explore__text', {x: '0'})
            gsap.to('.customize-nav', {right: '-100%'})
            gsap.to('.customize-bottom', {opacity: 0})
            gsap.to('.explore__bottom--text', {opacity: 0})
            gsap.to('.explore__btn', {yPercent: 0, delay: 1})

            cameraViews?.animateToView(view[3]);

            scroller.enabled = true;
        });

    }

    setupViewer()

});
