function preload(){	
  carImg= loadImage("upload_fc4425b4ca387e988f6909176caae0ca.gif")	
}

let video, bodypose, pose, keypoint, detector;
let poses = [];
let eyeAnimationProgress = 0;
let shoulderAnimationProgress = 0;
let animationSpeed = 0.01; // 調整此值可以控制動畫速度

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
   // 翻轉影像
  cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
  
}

function drawSkeleton() {
  // 繪製所有追蹤到的關鍵點
  for (let i = 0; i < poses.length; i++) {
    pose = poses[i];
  
    partA = pose.keypoints[0];

    if(partA.score > 0.1){
      push()
        textSize(40)  //文字大小
        scale(-1,1)   //翻轉
        text("412730201,陳妍希",partA.x-width,partA.y-150)
      pop()
    }
    
    for (j = 5; j < 9; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }
    // shoulder to shoulder
    let leftShoulder = pose.keypoints[5];
    let rightShoulder = pose.keypoints[6];
    if (leftShoulder.score > 0.1 && rightShoulder.score > 0.1) {
      // 繪製左邊肩綁位置固定的鳥 
      push();
      image(carImg, leftShoulder.x - 75, leftShoulder.y - 75, 150, 150);
      pop();

      // 計算鳥的x位置
      let animatedShoulderX = lerp(rightShoulder.x, leftShoulder.x, shoulderAnimationProgress);
      let animatedShoulderY = lerp(rightShoulder.y, leftShoulder.y, shoulderAnimationProgress);

      // 繪製右邊肩綁需要移動的鳥 
      push();
      image(carImg, animatedShoulderX - 75, animatedShoulderY - 75, 150, 150);
      pop();

      // 鳥翅膀動畫
      shoulderAnimationProgress += animationSpeed;
      if (shoulderAnimationProgress > 1 || shoulderAnimationProgress < 0) {
        animationSpeed *= -1; // 改變動畫方向
    }

    // eyes to eyes
    let leftEye = pose.keypoints[1];
    let rightEye = pose.keypoints[2];
    if (leftEye.score > 0.1 && rightEye.score > 0.1) {
      // 計算鳥的x位置
      let animatedEyeX = lerp(leftEye.x, rightEye.x, eyeAnimationProgress);
      let animatedEyeY = lerp(leftEye.y, rightEye.y, eyeAnimationProgress);

      // 繪製左邊眼睛需要移動的鳥
      push();
      image(carImg, animatedEyeX - 25, animatedEyeY - 25, 50, 50);
      pop();

      // 繪製右邊眼睛位置固定的鳥
      push();
      image(carImg, rightEye.x - 25, rightEye.y - 25, 50, 50);
      pop();

      // 鳥眼睛動畫
      eyeAnimationProgress += animationSpeed;
      if (eyeAnimationProgress > 1 || eyeAnimationProgress < 0) {
        animationSpeed *= -1; // Reverse the direction of the animation
      }
    }

    // hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // shoulders to hips
    partA = pose.keypoints[5];
    partB = pose.keypoints[11];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    partA = pose.keypoints[6];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // hip to foot
    for (j = 11; j < 15; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }
  }
}
}

// /* Points (view on left of screen = left part - when mirrored)
//   0 nose
//   1 left eye
//   2 right eye
//   3 left ear
//   4 right ear
//   5 left shoulder
//   6 right shoulder
//   7 left elbow
//   8 right elbow
//   9 left wrist
//   10 right wrist
//   11 left hip
//   12 right hip
//   13 left kneee
//   14 right knee
//   15 left foot
//   16 right foot
// */
/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet

*/
