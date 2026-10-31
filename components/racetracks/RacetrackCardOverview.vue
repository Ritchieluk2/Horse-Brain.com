<template>
    <div class="col-lg-6" data-aos="zoom-in" data-aos-delay="200">
            <div class="racetrack-item position-relative">
              <div class="img">
                <img src="https://www.keeneland.com/sites/default/files/2022-07/home-racing.jpg" class="img-fluid" alt="">
              </div>
              <div class="details">

                <a href="service-details.html" class="stretched-link"><img class="track-logo" src="https://www.keeneland.com/sites/default/files/KLand%20Logo-1%402x.png"></a>
                
                <div class="additional-details">
                  <div class="row">
                    <div class="col-md-4">
                      <h3>Date of Next Race</h3>
                      <p>{{ racetrack.date }}</p>
                    </div>
                    <div class="col-md-4">
                      <h3>Number of Races</h3>
                      <p>{{racetrack.num_races}}</p>
                    </div>
                    <div class="col-md-4">
                      <h3>First Post Time</h3>
                      <p>{{racetrack.post_time}}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div><!-- End Racetrack Item -->
</template>

<script>
export default {
    name: 'RacetrackCardOverview',
    props: ['racetrack']
}
</script>

<style scoped>

</style>
