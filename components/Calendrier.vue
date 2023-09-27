<template>
  <v-container>
    <v-row class="text-center">
    <v-col>
        <v-btn @click="previousMonth">
            <v-icon>mdi-chevron-left</v-icon>
            Précédent
        </v-btn>
    </v-col>
    <v-col>
        <h1> {{ months[currentDate.getMonth()] }} {{ currentDate.getFullYear() }} </h1>
    </v-col>
    <v-col>
        <v-btn @click="nextMonth">
            Suivant
            <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
    </v-col>
  </v-row>

    
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th v-for="day in days" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td
              v-for="(cell, cellIndex) in row" 
              :key="cellIndex"
              :class="cellClass(cell)"
              @click="toggleWorked(rowIndex, cellIndex)"
              style="width: 136px; height: 96px;"
            >
              <div v-if="cell.date" class="day-cell">
                <div class="day-number">{{ cell.date }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-row>
      <v-col cols="6">
        Jours travaillés : {{ workedDays }}
      </v-col>
      <v-col cols="6">
        <v-btn @click="submit">Valider</v-btn>
      </v-col>
      <v-col cols="6">
        Chiffre d'affaire : {{ monthlyRevenue }}€
      </v-col>
    </v-row>
  </v-container>
</template>

  
<script>
/* eslint-disable */
  export default {
    name: 'MonCalendrier',
    data() {
      return {
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        rows: [],
        months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        currentDate: new Date(),
        dailyRate: 275,
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
      }
    },
    watch: {
      currentMonth() {
        this.currentDate.setMonth(this.currentMonth - 1); 
        this.rows = this.generateRows();
      },
      currentYear() {
        this.currentDate.setFullYear(this.currentYear);
        this.rows = this.generateRows();
      }
  },
    computed: {
        currentMonthYear() {
          const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
          return `${monthNames[this.currentMonth]} ${this.currentYear}`
        },
        workedDays() {
          let count = 0
          for (let row of this.rows) {
            for (let cell of row) {
              if (cell.worked && !cell.isWeekend) {
                count++
              }
            }
          }
          return count
        },
        monthlyRevenue() {
          return this.workedDays * this.dailyRate
        }
    },
    created() {
      this.rows = this.generateRows()
    },
    methods: {
      nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.currentMonth = this.currentDate.getMonth() + 1; // Ajoutez 1 pour l'indexation
        this.fetchDataFromServer();
      },

      previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.currentMonth = this.currentDate.getMonth() + 1; // Ajoutez 1 pour l'indexation
        this.fetchDataFromServer();
      },

      toggleWorked(rowIndex, cellIndex) {
        if (this.rows[rowIndex][cellIndex].date && !this.rows[rowIndex][cellIndex].isWeekend) {
          this.$set(this.rows[rowIndex][cellIndex], 'worked', !this.rows[rowIndex][cellIndex].worked)
        }
      },

      generateRows() {
        const year = this.currentDate.getFullYear()
        const month = this.currentDate.getMonth()
        const now = new Date()
    
        let rows = []
        let date = 1
        let day = new Date(year, month, date).getDay()
        let rowIndex = 0, cellIndex = day === 0 ? 6 : day - 1
    
        for (let i = 0; i < cellIndex; i++) {
            rows[rowIndex] = [...(rows[rowIndex] || []), {}]
        }
    
        while (new Date(year, month, date).getMonth() === month) {
            if(!rows[rowIndex]) {
            rows[rowIndex] = []
            }
            rows[rowIndex][cellIndex] = { 
            date, 
            worked: false, 
            isWeekend: day === 0 || day === 6 
            }
            date++
            cellIndex++
            if (cellIndex > 6) {
            rowIndex++
            cellIndex = 0
            }
            day = new Date(year, month, date).getDay()
        }
    
        while (rows[rowIndex] && rows[rowIndex].length < 7) {
            rows[rowIndex].push({})
        }
    
        return rows;
      },

      cellClass(cell) {
        let classes = []
        if (!cell || !cell.date) {
          classes.push('unclassified')
        } else {
          if (cell.isWeekend) {
            classes.push('weekend')
          } else if (cell.worked) {
            classes.push('worked')
            classes.push('hoverable')
          } else {
            classes.push('unclassified')
          }
        }
        return classes.join(' ')
      },
      submit() {
    let dataArray = this.rows.flat().filter(cell => cell.worked).map(cell => {
      // Create a date string in format "YYYY-MM-DD"
      const dateString = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(cell.date).padStart(2, '0')}`;
      return { date: dateString, worked: cell.worked }
    });

    dataArray.forEach(dataObj => {
      this.$axios.post('https://127.0.0.1:8000/api/calendriers', dataObj, { headers: { 'Content-Type': 'application/json' } })
        .catch(error => {
          console.error('Erreur:', error);
        });
    });
},
    fetchDataFromServer() {
      const month = this.currentDate.getMonth() + 1;
      const year = this.currentDate.getFullYear();

      this.$axios.get(`https://127.0.0.1:8000/api/calendriers?month=${month}&year=${year}`)
        .then(response => {
          const data = response.data['hydra:member'];
          for (let item of data) {
            const dateParts = item.date.split("T")[0].split("-").map(part => parseInt(part, 10));
            const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

            const rowIndex = Math.floor((dateObj.getDate() - 1) / 7);
            const cellIndex = (dateObj.getUTCDay() || 7) - 1;

            if (this.rows[rowIndex] && this.rows[rowIndex][cellIndex]) {
              this.rows[rowIndex][cellIndex].worked = item.worked;
            }
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données:", error);
        });
      }
    },
    mounted() {
      this.fetchDataFromServer()
    }

  }
</script>
  
<style>
  th {
    height: 50px;
    width: 136px;
    border: 1px solid #000;
    text-align: center;
  }
  td {
    border: 1px solid #000;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  tr:hover {
    background-color: transparent !important;
  }
  
  .weekend {
    background-color:#969696;
    cursor: default;
  }
  
  .worked {
    background-color: green;
    cursor: pointer;
  }

  .hoverable:hover {
    background-color: #e0e0e0;
  }

  td.worked:hover {
    background-color: green !important;
  }
  
  td:hover:not(.weekend):not(.worked) {
    background-color: #f5f5f5;
  }
</style>
