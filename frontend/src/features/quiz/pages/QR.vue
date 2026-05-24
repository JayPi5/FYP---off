<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="QR Page Stage">
        <div class="layout">
          <img :src="magpieSrc" class="magpie" alt="Magpie" />

          <div class="bubble">
            <div class="bubbleTitle">Continuez l'expérience complète</div>
            <div class="bubbleSubtitle">
              Scannez le QR code pour continuer sur la plateforme Smokwit.
            </div>
          </div>

          <div class="qrCard" aria-label="QR Code Card">
            <QrDisplay />
            <div class="hint">Scanner pour continuer</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrDisplay from "@/features/discussion/components/QrDisplay.vue";
import { magpieSrc } from "@/shared/state/communityUi";
</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  background: #0b0b0c;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stageWrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage {
  width: var(--stage-w);
  height: var(--stage-h);
  position: relative;
  overflow: hidden;
}

.layout {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto auto 1fr;
  justify-items: center;
  align-items: start;
  padding: 120px 70px 90px;
  gap: 44px;
}

.magpie {
  width: 520px;
  height: auto;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.bubble {
  width: 920px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 44px;
  padding: 52px 56px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  text-align: center;
}

.bubbleTitle {
  font-weight: 900;
  font-size: 60px;
  color: #111;
  margin-bottom: 14px;
}

.bubbleSubtitle {
  font-weight: 700;
  font-size: 30px;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.75);
}

.qrCard {
  width: 640px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  align-self: start;
}

.hint {
  margin-top: 14px;
  text-align: center;
  font-weight: 800;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.9);
}

@media (orientation: landscape) {
  .layout {
    grid-template-rows: 1fr;
    grid-template-columns: 560px 1fr;
    align-items: center;
    justify-items: start;
    padding: 90px 60px;
    gap: 70px;
  }

  .magpie {
    width: 600px;
    justify-self: start;
  }

  .bubble {
    width: 880px;
    text-align: left;
  }

  .qrCard {
    width: 520px;
    justify-self: center;
  }

  .bubbleTitle {
    font-size: 56px;
  }

  .bubbleSubtitle {
    font-size: 28px;
  }
}
</style>
