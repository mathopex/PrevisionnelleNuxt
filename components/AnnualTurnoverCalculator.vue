<template>
  <div class="form-group">
    <label for="tjm">TJM:</label>
    <input type="number" v-model="localTjm" placeholder="Saisir le TJM" id="tjm" class="form-control">
  </div>
</template>

<script>
export default {
  props: ['TJM'],
  data() {
    return {
      localTjm: this.TJM,
    }
  },
  watch: {
    localTjm(newTjm) {
      this.$emit('getTjm', newTjm);
    },
    TJM(newTjm) {
      this.localTjm = newTjm;
    },
  },
}
</script>
