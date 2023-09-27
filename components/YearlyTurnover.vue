<template>
  <div>
    <div class="form-group">
      <label for="years">Nombre d'années:</label>
      <input type="number" v-model="localYears" placeholder="Saisir le nombre d'années" id="years" class="form-control">
    </div>
    <div v-for="(turnover, index) in yearlyTurnovers" :key="index" class="form-group row">
      <div class="col">
        <label :for="'annual-turnover-' + index">Chiffre d'affaires année {{ index + 1 }}:</label>
        <input type="number" readonly :value="turnover" :id="'annual-turnover-' + index" class="form-control">
      </div>
      <div class="col">
        <label :for="'monthly-turnover-' + index">Chiffre d'affaires mois année {{ index + 1 }}:</label>
        <input type="number" readonly :value="(turnover / 12).toFixed(0)" :id="'monthly-turnover-' + index" class="form-control">
      </div>
    </div>
  </div>
</template>

  
<script>
export default {
  props: ['TJM', 'years', 'workingDays'],
  data() {
    return {
      localYears: this.years, 
      yearlyTurnovers: [],
    }
  },
  watch: {
    localYears(newYears) {
      this.$emit('getYears', newYears);
      this.calculateYearlyTurnovers();
    },
    TJM() {
      this.calculateYearlyTurnovers();
    },
    years(newYears) {
      this.localYears = newYears;
      this.calculateYearlyTurnovers();
    },
  },
  methods: {
    calculateYearlyTurnovers() {
      this.yearlyTurnovers = [];
      let totalTurnover = this.TJM * this.workingDays * this.localYears;
      const maxAnnualTurnover = 66000;

      if (totalTurnover > maxAnnualTurnover * this.localYears) {
        let remainingYears = this.localYears;
        while (totalTurnover >= maxAnnualTurnover && remainingYears > 1) {
          this.yearlyTurnovers.push(maxAnnualTurnover);
          totalTurnover -= maxAnnualTurnover;
          remainingYears--;
        }
        this.yearlyTurnovers.push(totalTurnover);
      } else {
        const equalAnnualTurnover = totalTurnover / this.localYears;
        for (let i = 0; i < this.localYears; i++) {
          this.yearlyTurnovers.push(equalAnnualTurnover);
        }
      }
    },
  },
}
</script>
  