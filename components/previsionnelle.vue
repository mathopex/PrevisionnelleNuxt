<template>
  <div>
    <div class="form-row">
      <div class="col">
        <AnnualTurnoverCalculator @getTjm="getTjm" />
      </div>
      <div class="col">
        <div class="form-group">
          <label for="years">Nombre d'années:</label>
          <input type="number" v-model="years" placeholder="Saisir le nombre d'années" id="years" class="form-control">
        </div>
      </div>
    </div>
    <WorkingDaysCalculator :years="years" :workingDays="computedWorkingDays" />
    <YearlyTurnover :workingDays="computedWorkingDays" :TJM="TJM" :years="years" @getYears="getYears" />
  </div>
</template>


<script>
import WorkingDaysCalculator from './WorkingDaysCalculator.vue'
import AnnualTurnoverCalculator from './AnnualTurnoverCalculator.vue'
import YearlyTurnover from './YearlyTurnover.vue'

export default {
  name:"Monprevisionnelle",
  components: {
    WorkingDaysCalculator,
    AnnualTurnoverCalculator,
    YearlyTurnover,
  },
  data() {
    return {
      TJM: 0,
      years: 0,
    }
  },
  computed: {
    computedWorkingDays() {
      return this.years > 0 ? 365 - (2 * 52) - 11 - (5 * 7) : 0;
    }
  },
  methods:{
    getTjm(value) {
      this.TJM = value
    },
    getYears(value) {
      this.years = value
    },
  }
}
</script>
