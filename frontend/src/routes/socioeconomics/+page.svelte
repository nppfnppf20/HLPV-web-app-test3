<script>
  import { Card, Button, Heading, P, Alert } from 'flowbite-svelte';
  import { goto } from '$app/navigation';

  function goHome() {
    goto('/');
  }
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto">

    <!-- Header with Back Button -->
    <div class="mb-8">
      <Button
        color="light"
        size="sm"
        class="mb-4"
        on:click={goHome}>
        <i class="las la-arrow-left mr-2"></i>
        Back to Home
      </Button>
    </div>

    <!-- Main Content -->
    <div class="text-center mb-12">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="las la-chart-bar text-4xl text-green-600"></i>
      </div>

      <Heading tag="h1" class="text-4xl font-bold text-gray-900 mb-4">
        Socioeconomics Tool
      </Heading>

      <P class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Comprehensive socioeconomic analysis for planning and development decisions
      </P>
    </div>

    <!-- Coming Soon Card -->
    <Card class="p-12 text-center max-w-2xl mx-auto">
      <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="las la-tools text-3xl text-yellow-600"></i>
      </div>

      <Heading tag="h2" class="text-2xl font-bold text-gray-900 mb-4">
        Under Development
      </Heading>

      <P class="text-gray-600 mb-8 leading-relaxed">
        The Socioeconomics Tool is currently under development. This tool will provide comprehensive
        analysis of demographic data, employment patterns, transportation methods, health statistics,
        and educational qualifications to help understand community characteristics and development impacts.
      </P>

      <Alert color="blue" class="mb-8">
        <i class="las la-info-circle mr-2"></i>
        <span class="font-medium">Coming Soon:</span>
        Interactive socioeconomic data analysis with census integration and demographic mapping.
      </Alert>

      <div class="space-y-4 text-left max-w-md mx-auto mb-8">
        <div class="flex items-center gap-3">
          <i class="las la-users text-blue-500 text-xl"></i>
          <span class="text-gray-700">Population Demographics Analysis</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="las la-briefcase text-blue-500 text-xl"></i>
          <span class="text-gray-700">Employment & Occupation Data</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="las la-car text-blue-500 text-xl"></i>
          <span class="text-gray-700">Transportation Patterns</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="las la-heart text-blue-500 text-xl"></i>
          <span class="text-gray-700">Health & Wellbeing Statistics</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="las la-graduation-cap text-blue-500 text-xl"></i>
          <span class="text-gray-700">Education & Qualifications</span>
        </div>
      </div>

      <Button
        color="alternative"
        size="lg"
        on:click={goHome}>
        <i class="las la-home mr-2"></i>
        Return to Home
      </Button>
    </Card>

    <!-- Additional Info -->
    <div class="mt-12 text-center">
      <P class="text-gray-500">
        This tool will integrate with the existing Socioeconomics database schema containing
        Countries, LAD boundaries, and comprehensive census data.
      </P>
    </div>
  </div>
</div>