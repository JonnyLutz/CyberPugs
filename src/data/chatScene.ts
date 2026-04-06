import { heroBackdrop } from './cyberpugs'

/** Layered `/media/...` assets for the comms-bay chat page (cyberpunk lab + gear). */
export const chatScene = {
  /** Primary interior: neon workshop / lab */
  workshop:
    '/media/6b025a17-0370-4bf8-a515-6ae6b8d5b90e-1b07a416-3e5e-4831-9294-02c3bf98ac13.png',
  /** Purple / cyan synth rack — mid-ground glow */
  synthConsole:
    '/media/db888863-b4f3-4ed8-be48-fecd694ab64f-584fd37e-b105-43dd-a26b-9e5f74d346b8.png',
  /** Cyan grid console — HUD accent */
  cyanPanel:
    '/media/2d5d4c0e-9980-48a4-98fb-dce8a5d63c3c-5835be10-17a5-4702-a173-e6641a1db7b2.png',
  /** Datapad — corner prop */
  datapad:
    '/media/f91e9159-4723-4f87-9001-2e42945f82a7-949ec9d5-7a52-4b55-952c-473b00958f50.png',
  /** City alley wash (same as catalog hero) */
  cityAlley: heroBackdrop,
} as const
