<template>
  <div>
    <!-- Tabs navigation -->
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a 
          class="nav-link bg-primary text-white cursor-pointer" 
          :class="tabSelectedClass('tab1')" 
          @click="currentTab = 'tab1'">Previsionnelle</a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link bg-primary text-white cursor-pointer" 
          :class="tabSelectedClass('tab2')" 
          @click="currentTab = 'tab2'">Calendrier</a>
      </li>
    </ul>

    <!-- Tabs content -->
    <div class="tab-content mt-2">
      <div v-if="currentTab === 'tab1'" class="tab-pane active">
        <previsionnelle />
      </div>
      <div v-if="currentTab === 'tab2'" class="tab-pane active">
        <Calendrier />
      </div>
    </div>
  </div>
</template>

<script>
import Calendrier from '~/components/Calendrier.vue'
import previsionnelle from '~/components/previsionnelle.vue';

export default {
  components: { Calendrier, previsionnelle },

  data() {
    return {
      currentTab: 'tab1'
    }
  },

  methods: {
    tabSelectedClass(tab) {
      if (this.currentTab === tab) {
        return { 'font-weight-bold': true };
      }
      return {};
    }
  }
}
</script>

<style scoped>
.active {
  color: #495057 !important;
  background-color: #fff !important;
  border-color: #dee2e6 #dee2e6 #fff !important;
}

.font-weight-bold {
  font-weight: bold !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
