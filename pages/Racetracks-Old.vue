<template>
  <div>
    <PageTitle />
    <ActiveRacetracksOverview />
    <Racetracks />
  </div>
</template>

<script>
import RacedayContainerList from '@/components/data_display/Racedays/RacedayContainerList';
import PageTitle from '@/components/snippets/PageTitle';
import ActiveRacetracksOverview from '@/components/racetracks/ActiveRacetracksOverview';
import TestSwiper from '@/components/racetracks/TestSwiper';
import Racetracks from '@/components/racetracks/Racetracks';

export default {
  name: 'index',
  components: {
    RacedayContainerList,
    PageTitle,
    ActiveRacetracksOverview,
    TestSwiper,
    Racetracks
  }
};
</script>
