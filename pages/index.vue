<script setup lang="ts">
import type { EnhancedProduct } from "~/components/business/ProductCard.vue";
import { useI18n } from "vue-i18n";
import { createSkeletonLayout } from "~/composables/shared/skeleton-utils";

// Type definitions
interface FeatureLink {
  label: string;
  to: string;
  class: string;
  trailingIcon: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
  links: FeatureLink[];
}

const { t } = useI18n();

// SEO configuration
useSeoMeta({
  title: t("home.seo.title"),
});

const links = computed(() => [
  {
    label: t("home.hero.getStarted"),
    to: "/get-started",
    color: "primary" as const,
    size: "xl" as const,
    icon: "i-lucide-square-play",
  },
  {
    label: t("home.hero.exploreProducts"),
    to: "#products",
    color: "neutral" as const,
    variant: "link" as const,
    size: "lg" as const,
    trailingIcon: "lucide:chevron-right",
  },
]);

// Enhanced product data with i18n support
const additionalProducts = computed<EnhancedProduct[]>(
  () => [
    {
      id: "1",
      title: t("home.products.payments.items.0.title"),
      description: t(
        "home.products.payments.items.0.description"
      ),
      icon: "i-heroicons-globe-alt",
      to: "/web-platform",
      docsCount: 24,
      lastUpdated: "2024-06-15",
      tags: [
        t("tags.frontend"),
        t("tags.api"),
        t("tags.guides"),
      ],
      status: "updated",
    },
    {
      id: "2",
      title: t("home.products.payments.items.1.title"),
      description: t(
        "home.products.payments.items.1.description"
      ),
      icon: "i-heroicons-device-phone-mobile",
      to: "/mobile-sdk",
      docsCount: 18,
      lastUpdated: "2024-06-10",
      tags: [
        t("tags.mobile"),
        t("tags.sdk"),
        t("tags.ios"),
        t("tags.android"),
      ],
    },
    {
      id: "3",
      title: t("home.products.payments.items.2.title"),
      description: t(
        "home.products.payments.items.2.description"
      ),
      icon: "i-heroicons-cloud",
      to: "/cloud-services",
      docsCount: 32,
      lastUpdated: "2024-06-12",
      tags: [
        t("tags.cloud"),
        t("tags.infrastructure"),
        t("tags.deployment"),
      ],
      status: "new",
    },
    {
      id: "4",
      title: t("home.products.payments.items.3.title"),
      description: t(
        "home.products.payments.items.3.description"
      ),
      icon: "i-heroicons-chart-bar",
      to: "/data-analytics",
      docsCount: 15,
      lastUpdated: "2024-06-08",
      tags: [
        t("tags.analytics"),
        t("tags.reporting"),
        t("tags.insights"),
      ],
    },
    {
      id: "5",
      title: t("home.products.payments.items.4.title"),
      description: t(
        "home.products.payments.items.4.description"
      ),
      icon: "i-heroicons-shield-check",
      to: "/security-tools",
      docsCount: 21,
      lastUpdated: "2024-06-14",
      tags: [
        t("tags.security"),
        t("tags.authentication"),
        t("tags.encryption"),
      ],
      status: "beta",
    },
  ]
);

// Feature data with i18n support
const linkBaseClass =
  "text-primary font-medium hover:text-muted transition-colors duration-200 flex items-center gap-1";

const features = computed<Feature[]>(() => [
  {
    title: t("home.features.items.0.title"),
    description: t("home.features.items.0.description"),
    icon: "i-heroicons-building-storefront",
    links: [
      {
        label: t("home.features.items.0.links.0.label"),
        to: "/payments",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
      {
        label: t("home.features.items.0.links.1.label"),
        to: "https://sandbox-portal.onerway.com/",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
      {
        label: t("home.features.items.0.links.2.label"),
        to: "https://docs.onerway.com/apis/zh/v0.6/settlement-file",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
    ],
  },
  {
    title: t("home.features.items.1.title"),
    description: t("home.features.items.1.description"),
    icon: "i-heroicons-credit-card",
    links: [
      {
        label: t("home.features.items.1.links.0.label"),
        to: "https://postman.onerway.com/",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
      {
        label: t("home.features.items.1.links.1.label"),
        to: "/payments",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
    ],
  },
  {
    title: t("home.features.items.2.title"),
    description: t("home.features.items.2.description"),
    icon: "i-heroicons-code-bracket",
    links: [
      {
        label: t("home.features.items.2.links.0.label"),
        to: "/payments",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
      {
        label: t("home.features.items.2.links.1.label"),
        to: "/payments",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
      {
        label: t("home.features.items.2.links.2.label"),
        to: "/payments",
        class: linkBaseClass,
        trailingIcon: "i-heroicons-arrow-right",
      },
    ],
  },
]);

const handleProductClick = (product: EnhancedProduct) => {
  if (!product?.to) return;
  navigateTo(product.to);
};

// 骨架屏布局配置
const heroSkeleton = createSkeletonLayout.hero();
</script>

<template>
  <main
    role="main"
    aria-label="Onerway Documentation Homepage">
    <UContainer>
      <img
        class="absolute top-0 left-0 w-full max-sm:hidden dark:hidden max-h-7/12"
        src="/background.webp"
        alt=""
        aria-hidden="true"
        loading="lazy" />

      <div
        class="absolute left-0 light:w-full light:h-7/12 max-sm:hidden dot-background"
        aria-hidden="true">
      </div>
      <!-- Hero Section -->
      <UContainer>
        <section aria-labelledby="hero-title">
          <ClientOnly>
            <UPageHero
              :description="
                $t('home.documentation.description')
              "
              orientation="horizontal"
              :links="links"
              :ui="{
                container: 'py-8 sm:py-12 lg:py-16',
                title: 'text-3xl sm:text-4xl font-bold',
              }">
              <template #title>
                <h1 id="hero-title">{{
                  $t("home.documentation.title")
                }}</h1>
              </template>

              <!-- Recently viewed pages and test card -->
              <aside
                class="relative sm:max-w-xs max-sm:hidden"
                aria-label="Recently viewed pages and test card preview">
                <!-- Recently viewed component -->
                <div class="relative z-10">
                  <RecentlyViewed
                    class="backdrop-blur-xs bg-white/10 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-black/10 rounded-xl" />
                </div>

                <!-- Test card preview - desktop overlay effect, hidden on mobile -->
                <div
                  class="hidden lg:block absolute z-0 pointer-events-none"
                  role="presentation">
                  <TestCardPreview
                    class="transform -rotate-12 translate-x-1/2 -translate-y-2/5 hover:-rotate-6 hover:scale-105 transition-transform duration-500 ease-out pointer-events-auto" />
                </div>
              </aside>
            </UPageHero>
            <template #fallback>
              <!-- Hero section skeleton with enhanced UX -->
              <div
                class="relative isolate"
                aria-label="Loading documentation homepage">
                <div
                  class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid gap-16 sm:gap-y-24 lg:grid-cols-2 lg:items-center py-8 sm:py-12 lg:py-16">
                  <!-- Left side - Hero content skeleton -->
                  <div :class="heroSkeleton.container">
                    <!-- Title skeleton with staggered animation -->
                    <div
                      class="space-y-3"
                      role="status"
                      aria-label="Loading page title">
                      <div
                        :class="heroSkeleton.title"
                        style="animation-delay: 0.1s"></div>
                      <div
                        :class="heroSkeleton.subtitle"
                        style="animation-delay: 0.2s"></div>
                    </div>

                    <!-- Description skeleton -->
                    <div
                      class="space-y-2"
                      role="status"
                      aria-label="Loading page description">
                      <div
                        v-for="(
                          descClass, index
                        ) in heroSkeleton.description"
                        :key="index"
                        :class="descClass"
                        :style="`animation-delay: ${0.3 + index * 0.1}s`">
                      </div>
                    </div>

                    <!-- Buttons skeleton -->
                    <div
                      class="flex flex-wrap gap-x-6 gap-y-3 mt-10"
                      role="status"
                      aria-label="Loading action buttons">
                      <div
                        v-for="(
                          buttonClass, index
                        ) in heroSkeleton.buttons"
                        :key="index"
                        :class="buttonClass"
                        :style="`animation-delay: ${0.5 + index * 0.1}s`">
                      </div>
                    </div>
                  </div>

                  <!-- Right side - Sidebar skeleton -->
                  <div
                    class="relative sm:max-w-xs max-sm:hidden">
                    <div
                      class="skeleton-card h-64"
                      style="animation-delay: 0.7s"
                      role="status"
                      aria-label="Loading sidebar content">
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </ClientOnly>
        </section>
      </UContainer>

      <!-- Features Section -->
      <section aria-labelledby="features-title">
        <UPageSection
          :ui="{
            container: 'py-8 sm:py-0 lg:py-0 my-8',
          }">
          <h2
            id="features-title"
            class="sr-only"
            >{{ $t("home.features.title") }}</h2
          >
          <template #features>
            <ClientOnly>
              <UPageFeature
                v-for="feature in features"
                :key="feature.title"
                :title="feature.title"
                :description="feature.description"
                target="_blank"
                :ui="{
                  root: 'group relative overflow-hidden rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-102',
                  title: 'text-xl font-bold mb-3',
                  description: 'mb-6',
                }">
                <template #leading>
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20"
                    aria-hidden="true">
                    <UIcon
                      :name="feature.icon"
                      class="h-6 w-6 text-primary"
                      :aria-label="feature.title" />
                  </div>
                </template>
                <template #title>
                  <h3 class="text-xl font-bold mb-3">
                    {{ feature.title }}
                  </h3>
                </template>
                <template #description>
                  <div class="space-y-2">
                    <UPageLinks
                      :links="feature.links"
                      class="text-primary"
                      :ui="{
                        item: 'group/link',
                        link: 'relative',
                      }">
                      <template #link-trailing="{ link }">
                        <UIcon
                          :name="link.trailingIcon"
                          class="size-4 text-muted opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
                      </template>
                    </UPageLinks>
                  </div>
                </template>
              </UPageFeature>
              <template #fallback>
                <!-- Features section skeleton with enhanced UX -->
                <div
                  class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  role="status"
                  aria-label="Loading feature cards">
                  <div
                    v-for="index in 3"
                    :key="index"
                    class="skeleton-card p-6 space-y-4"
                    :style="`animation-delay: ${index * 0.15}s`">
                    <!-- Feature icon skeleton -->
                    <div
                      class="skeleton-base bg-gray-200 dark:bg-gray-700 rounded-lg h-12 w-12"></div>

                    <!-- Feature title skeleton -->
                    <div
                      class="skeleton-title h-6 w-3/4"></div>

                    <!-- Feature description skeleton -->
                    <div class="space-y-2">
                      <div
                        class="skeleton-text h-4 w-full"></div>
                      <div
                        class="skeleton-text h-4 w-5/6"></div>
                    </div>

                    <!-- Feature links skeleton -->
                    <div class="space-y-2 pt-2">
                      <div
                        class="skeleton-text h-4 w-24"></div>
                      <div
                        class="skeleton-text h-4 w-32"></div>
                    </div>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </template>
        </UPageSection>
      </section>

      <!-- Try It Out Section -->
      <UContainer>
        <section
          aria-labelledby="try-it-out"
          class="max-lg:hidden">
          <ProseH2 id="try-it-out">
            {{ $t("home.tryItOut.title") }}
          </ProseH2>
          <LazyTerminalCarousel
            aria-label="Interactive API examples" />
        </section>
      </UContainer>

      <!-- Products section -->
      <UContainer>
        <section aria-labelledby="products">
          <div class="mb-16">
            <ProseH2 id="products">
              {{ $t("home.products.browse.title") }}
            </ProseH2>

            <section aria-labelledby="payments">
              <ProseH3
                id="payments"
                class="text-muted">
                {{ $t("home.products.payments.title") }}
              </ProseH3>

              <UPageGrid
                class="mb-12"
                role="grid"
                :aria-label="
                  $t('home.products.payments.description')
                ">
                <ProductCard
                  v-for="product in additionalProducts"
                  :key="product.id"
                  :product="product"
                  :clickable="true"
                  class="group hover:scale-[1.02] hover:bg-default transition-transform duration-300"
                  role="gridcell"
                  @click="handleProductClick" />
              </UPageGrid>
            </section>
          </div>

          <section aria-labelledby="transfer">
            <ProseH3
              id="transfer"
              class="text-muted">
              {{ $t("home.products.transfer.title") }}
              <UBadge
                class="font-bold rounded-lg ml-2 -translate-y-1"
                trailing-icon="i-heroicons-clock"
                :aria-label="
                  $t('home.products.transfer.comingSoon')
                ">
                {{
                  $t("home.products.transfer.comingSoon")
                }}
              </UBadge>
            </ProseH3>
          </section>
        </section>
      </UContainer>

      <!-- CTA Section -->
      <section aria-labelledby="cta-title">
        <UPageSection>
          <UPageCTA
            :title="$t('home.cta.title')"
            :description="$t('home.cta.description')"
            :ui="{
              container:
                'flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16',
              footer: 'mt-8',
            }"
            :links="[
              {
                label: $t('home.cta.start'),
                to: '/get-started',
                size: 'lg',
              },
            ]" />
        </UPageSection>
      </section>
    </UContainer>
  </main>
</template>

<style scoped>
.dot-background {
  background-image: radial-gradient(
    rgba(0, 0, 0, 0) 1.5px,
    #fff 1px
  );
  background-size: 14px 14px;
}

.dark .dot-background {
  animation: pulse 2.5s infinite;
  background-image: radial-gradient(
    circle,
    rgba(238, 9, 223, 0.1) 20%,
    rgba(238, 9, 223, 0.06) 60%
  );
  background-size: contain;
}
</style>
