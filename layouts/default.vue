<template>
  <div>
    <AnnouncementBar />
    <Header />
    <NuxtLoadingIndicator/>
    <main>
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import AnnouncementBar from '@/components/AnnouncementBar.vue';

export default {
  components: {
    Header,
    Footer,
    AnnouncementBar,
  }
}
</script>