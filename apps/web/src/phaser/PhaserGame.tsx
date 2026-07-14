// apps/web/src/phaser/PhaserGame.tsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';

interface PhaserGameProps {
  config: Phaser.Types.Core.GameConfig;
  onGameReady?: (game: Phaser.Game) => void;
}

export interface PhaserGameRef {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(
  ({ config, onGameReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useImperativeHandle(ref, () => ({
      get game() { return gameRef.current; },
      get scene() {
        return gameRef.current?.scene.scenes[0] ?? null;
      }
    }));

    useEffect(() => {
      if (!containerRef.current || gameRef.current) return;

      const finalConfig: Phaser.Types.Core.GameConfig = {
        ...config,
        parent: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      };

      const game = new Phaser.Game(finalConfig);
      gameRef.current = game;
      onGameReady?.(game);

      const handleResize = () => {
        if (gameRef.current && containerRef.current) {
          gameRef.current.scale.resize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        game.destroy(true);
        gameRef.current = null;
      };
    }, []);

    return (
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />
    );
  }
);

PhaserGame.displayName = 'PhaserGame';
