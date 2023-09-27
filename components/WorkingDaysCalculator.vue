<template>
    <div class="form-group row">
      <div class="col">
        <label for="working-days">Nombre de jours de travail dans une année:</label>
        <input type="number" readonly :value="workingDays" id="working-days" class="form-control">
      </div>
      <div class="col">
        <label for="total-working-days">Nombre total de jours de travail:</label>
        <input type="number" readonly :value="totalWorkingDays" id="total-working-days" class="form-control">
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['years', 'workingDays'],
    computed: {
      totalWorkingDays() {
        return this.workingDays * this.years;
      },
    },
  }
  </script>