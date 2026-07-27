const POSES = [
  {
    name: "Child's Pose",
    difficulty: "Beginner",
    focus: ["flexibility", "stress_relief"],
    unsafeFor: ["knee_pain"],
    baseBreaths: 6,
    baseReps: 1,
    instructions: "Rest your hips on your heels, extend your arms forward, and rest your forehead on the mat. Breathe deeply."
  },
  {
    name: "Downward-Facing Dog",
    difficulty: "Beginner",
    focus: ["flexibility", "strength"],
    unsafeFor: ["high_bp"],
    baseBreaths: 5,
    baseReps: 1,
    instructions: "Press your hands into the mat, lift your knees, and push your hips up and back to form an inverted V-shape. Keep your head relaxed."
  },
  {
    name: "Cobra Pose",
    difficulty: "Beginner",
    focus: ["strength", "flexibility"],
    unsafeFor: ["back_pain"],
    baseBreaths: 5,
    baseReps: 3,
    instructions: "Lie face down, place hands under shoulders, and gently lift your chest off the mat while keeping your pelvis on the floor."
  },
  {
    name: "Warrior II",
    difficulty: "Intermediate",
    focus: ["strength", "weight_loss"],
    unsafeFor: ["knee_pain"],
    baseBreaths: 5,
    baseReps: 2,
    instructions: "Stand with feet wide apart, turn right foot out 90 degrees, bend right knee, and extend arms parallel to the floor. Gaze over right hand."
  },
  {
    name: "Tree Pose",
    difficulty: "Beginner",
    focus: ["strength", "stress_relief"],
    unsafeFor: [],
    baseBreaths: 5,
    baseReps: 1,
    instructions: "Stand tall, place the sole of your right foot on your left inner thigh or calf (avoiding the knee), bring hands to prayer at chest."
  },
  {
    name: "Plank Pose",
    difficulty: "Intermediate",
    focus: ["strength", "weight_loss"],
    unsafeFor: ["back_pain"],
    baseBreaths: 4,
    baseReps: 3,
    instructions: "Align shoulders over wrists, step feet back, and engage your core to keep your body in a straight line from head to heels."
  },
  {
    name: "Bridge Pose",
    difficulty: "Beginner",
    focus: ["strength", "flexibility"],
    unsafeFor: ["neck_pain"],
    baseBreaths: 6,
    baseReps: 3,
    instructions: "Lie on your back, bend knees, place feet flat on the floor, and press into feet to lift your hips. Clasp hands underneath."
  },
  {
    name: "Forward Fold",
    difficulty: "Beginner",
    focus: ["flexibility", "stress_relief"],
    unsafeFor: ["back_pain"],
    baseBreaths: 6,
    baseReps: 1,
    instructions: "Stand tall, exhale and bend at your hips, letting your head and arms hang heavy towards the floor. Keep knees slightly bent if needed."
  },
  {
    name: "Cat-Cow Stretch",
    difficulty: "Beginner",
    focus: ["flexibility", "stress_relief"],
    unsafeFor: [],
    baseBreaths: 8,
    baseReps: 1,
    instructions: "On your hands and knees, arch your back towards the ceiling on exhale (Cat) and drop your belly towards the floor on inhale (Cow)."
  },
  {
    name: "Triangle Pose",
    difficulty: "Intermediate",
    focus: ["flexibility", "strength", "weight_loss"],
    unsafeFor: ["back_pain"],
    baseBreaths: 5,
    baseReps: 2,
    instructions: "Stand with feet wide, reach right arm forward and tilt down, placing hand on shin or block, and extend left arm to the ceiling."
  },
  {
    name: "Savasana",
    difficulty: "Beginner",
    focus: ["stress_relief"],
    unsafeFor: [],
    baseBreaths: 15,
    baseReps: 1,
    instructions: "Lie flat on your back, feet apart, arms by your side with palms facing up. Close your eyes and relax your entire body."
  }
];

module.exports = { POSES };
