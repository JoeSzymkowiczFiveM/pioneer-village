declare interface RPC {
  getCharacters: () => Game.Character[];
}

declare namespace Game {
  interface Character {
    id: number;
    accountId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    createdAt: string;
    deletedAt?: string;
    lastX: number;
    lastY: number;
    lastZ: number;
    model: string;
    face: Face;
    components: number[];
  }

  interface Face {
    id: number;
    noseHeight: number;
    lowerLipWidth: number;
    upperLipHeight: number;
    earlobeSize: number;
    lowerLipHeight: number;
    eyebrowHeight: number;
    jawHeight: number;
    eyesDistance: number;
    mouthDepth: number;
    mouthWidth: number;
    noseCurvature: number;
    eyebrowDepth: number;
    earsHeight: number;
    noseSize: number;
    headWidth: number;
    eyelidWidth: number;
    mouthYPos: number;
    earsWidth: number;
    jawWidth: number;
    nostrilsDistance: number;
    noseWidth: number;
    eyesHeight: number;
    chinHeight: number;
    upperLipWidth: number;
    eyebrowWidth: number;
    cheekBoneWidth: number;
    chinWidth: number;
    eyesAngle: number;
    earsAngle: number;
    jawDepth: number;
    eyelidHeight: number;
    cheekBoneHeight: number;
    chinDepth: number;
    cheekBoneDepth: number;
    upperLipDepth: number;
    noseAngle: number;
    mouthXPos: number;
    lowerLipDepth: number;
    eyesDepth: number;
    overlays: Record<string, any>;
  }

  interface Outfit {
    id: number;
    name: string;
    components: number[];
  }
}
