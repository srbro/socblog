<template>
  <div class="container">
    <!--<img class="bg-image" :src="bgImageUrl">-->
    <div class="header">
    <div class="title">{{ title }}</div>
  </div>
  <!--  <div class="rainbow"></div>-->
  <div class="otpText">
    <div class="text">1) {{ activationText1 }}{{ activationText3 }}</div>
    <!--   <div class="text">{{ activationText1 }}</div> -->
    <div class="text">2) {{ activationText4 }}</div>
  </div>

    <div class="textActCode">{{ activationCode }}</div>
    <div id="activationCode" class="pin">{{ pin }}</div>
    <div class="footer-text">{{ footerText1 }}</div>
    <div class="footer-text">{{ footerText2 }}</div>
    <!-- <div class="textActCode">{{ text }}</div>-->
  </div>
</template>

<script>
export default {
  name: 'Activation',
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
    footerText1: {
      type: String
      // required: true
    },
    footerText2: {
      type: String
      // required: false
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$border-width: 4rem;
.container {
  background-color: $white-light;
  height: 100%;
  width: 100%;
  text-align: center;
}
.header {
  background-color: $white-light;
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
  padding-top: 120rem;
  margin: auto;
  padding-bottom: 96rem;

}
.title {
  font-size: 82rem;
  margin: 55rem 0 0 0;
  font-weight: 300;
  color: $blue-dark;
}
.text {
  width: 70%;
  margin:auto;
  padding-left: 77rem;
  text-align: left;
  color: $blue-dark;
  font-size: 40rem;
  font-weight: 300;
  margin-top: 5rem;
}
.pin {
  color: $blue-dark;
  font-size: 226rem;
  font-weight: 700;
  padding-top: 5rem;
  letter-spacing: 10rem;
  padding-bottom: 147rem;
}
.blueLink {
  color: $blue;
}
.textActCode {
  color:  #323e43;
  font-size: 28rem;
  font-weight: 500;
  text-transform: uppercase;
}
.footer-text {
  margin:auto;
  width: 50%;
  color:  #323e43;
  font-size: 28rem;
  font-weight: 400;
}
</style>
