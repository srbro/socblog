<template>
<div :class="containerClass">

  <div class="headercontainer">
    <div class="header">
    <div class="title">{{ title }}</div>
  </div>

  <div class="otpText">
    <div class="text">1) {{ activationText1 }}{{ activationText3 }}</div>
    <!--   <div class="text">{{ activationText1 }}</div> -->
    <div class="text">2) {{ activationText4 }}</div>
  </div>

  <div class="textActCode">{{ activationCode }}</div>
  <div class="pin">{{ pin }}</div>
  <div class="textActCode">{{ serialLabel }}</div>
  <div class="serial">{{ serial }}</div>
  <div class="footer-text">{{ footerText1 }}</div>
  <div class="footer-text">{{ footerText2 }}</div>
    <!-- <div class="textActCode">{{ text }}</div>-->
  </div>

</div>
</template>

<script>
export default {
  name: 'ActivationSerial',
  props: {
    bgImageUrl: {
      type: String
      // required: true
    },

    title: {
      type: String
      // required: true
    },
    text: {
      type: String
      // required: true
    },
    activationCode: {
      type: String
      // required: true
    },
    activationText1: {
      type: String
      // required: true
    },
    activationText2: {
      type: String
      // required: true
    },
    activationText3: {
      type: String
      // required: true
    },
    activationText4: {
      type: String
      // required: true
    },
    pin: {
      type: String
      // required: true
    },
    serial: {
      type: String
      // required: false
    },
    footerText1: {
      type: String
      // required: true
    },
    footerText2: {
      type: String
      // required: false
    },
    blackTheme: {
      type: Boolean,
      default: false
    },
    serialLabel: {
      type: String
    }
  },
  computed: {
    containerClass () {
      return ['container',
        {
          'invert': this.blackTheme
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$border-width: 4rem;

.container {
  display: flex;
  background-color: $white-light;
  color: $blue-dark;
  width: 100%;
  height: 100%;
  font-weight: 300;
  &.invert {
    background-color: #212121;
    color: #fcfcfc;
    .pin, .serial {
      color: #00aff1;
    }
    .textActCode, .footer-text {
      color: #fcfcfc;
    }
  }
  .headercontainer {
    height: 100%;
    width: 100%;
    text-align: center;
  }
  .header {
    border-bottom: $border-width solid transparent;
    box-shadow: $box-shadow-default-down;
    display: flex;
    height: 190rem;
    justify-content: center;
    position: relative;
    z-index: 1;
    &:after {
      content: '';
      position: absolute;
      bottom: -$border-width;
      height: $border-width;
      background: $rainbow-gradient-horizontal;
      width: 100%;
      left: 0;
    }
  }

  .otpText {
    padding-top: 86rem;
    margin: auto;
    padding-bottom: 102rem;
  }
  .title {
    font-size: 82rem;
    margin: 55rem 0 0 0;
    font-weight: 300;
  }
  .text {
    width: 60%;
    margin: auto;
    padding-left: 77rem;
    text-align: left;
    font-size: 34rem;
    font-weight: 300;
    margin-top: 5rem;
  }
  .pin {
    font-size: 162rem;
    font-weight: 700;
    letter-spacing: 8rem;
    padding-top: 10rem;
    padding-bottom: 75rem;
  }
  .serial {
    color:  #323e43;
    font-size: 54rem;
    font-weight: 400;
    padding-bottom: 80rem;
    padding-top: 17px;
    letter-spacing: 0.5rem;
  }
  .blueLink {
    color: $blue;
  }
  .textActCode {
    color:  #323e43;
    font-size: 28rem;
    font-weight: 300;
    text-transform: uppercase;
  }
  .footer-text {
    margin:auto;
    width: 45%;
    color:  #323e43;
    font-size: 28rem;
    font-weight: 300;
  }
}
</style>
