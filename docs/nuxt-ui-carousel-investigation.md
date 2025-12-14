# nuxt-ui-carousel-investigation

## 1. 概述

本项目的 `ProseCarousel` 基于 Nuxt UI 的 `UCarousel`（内部使用 Embla）实现轮播/滑动能力，并在其外层补齐：

- 基于 `#slide-n` 命名 slots 的 slide 收集（便于未来与 Nuxt Content MDC 语法衔接）
- 多种 triggers（tabs / dots / thumbnails / numbers / progress）
- `tabs.orientation = vertical` 时左侧并排、与 slides 同高的布局
- autoplay 交互暂停（通过 Embla Autoplay plugin 暴露 API）

> 结论：**滚动/手势/插件**交给 `UCarousel`，**文档内容友好的 API 与触发器布局**由 `ProseCarousel` 负责。

## 2. 源码位置与完整代码

### 2.1 Nuxt UI `UCarousel` 相关

- Nuxt UI 文档：`https://ui.nuxt.com/docs/components/carousel`
- 组件名称：`UCarousel`
- 内部基于 Embla Carousel（并集成官方 plugins：autoplay/auto-scroll/auto-height/fade/wheel-gestures/class-names）

> 本项目使用的 `UCarousel` 源码与样式配置在本地可直接定位：
>
> - 组件实现：`node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue`
> - 类型声明：`node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue.d.ts`
> - 编译后的 theme（#build 输出）：`.nuxt/ui/carousel.ts`

#### 2.1.1 组件层级关系（与 `accordion` 文档对齐）

```
┌─────────────────────────────────────────────────────────────┐
│                      ProseCarousel.vue                       │
│      app/components/content/carousel/ProseCarousel.vue       │
│                                                             │
│  • 负责 #slide-n slots 收集 / triggers / layout / pause      │
│  • 内部使用 UCarousel                                       │
└─────────────────────────────┬───────────────────────────────┘
                              │ 内部使用
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         UCarousel                            │
│  node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue  │
│                                                             │
│  • 基于 Embla Carousel（useEmblaCarousel）                   │
│  • 按需动态加载 Embla plugins（autoplay/fade/autoHeight…）   │
│  • 提供 arrows / dots / keyboard navigation / expose api     │
└─────────────────────────────┬───────────────────────────────┘
                              │ 依赖
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Embla Carousel                         │
│                   embla-carousel / embla-carousel-vue        │
│                                                             │
│  • 滑动引擎、snap、scrollTo、plugins 生命周期                │
└─────────────────────────────────────────────────────────────┘
```

#### 2.1.2 `UCarousel` 核心实现摘录（关键逻辑）

- **Theme + tv 合并 appConfig**：`UCarousel` 通过 `tv(theme)` + `appConfig.ui.carousel` 合成最终类名，并根据 `orientation` 做 variants。

```js
const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.carousel || {} })({
  orientation: props.orientation
}));
```

- **Embla options**：`axis` 会随 `orientation` 在 x/y 间切换；同时根据 `dir` 设置 `direction`。

```js
const options = computed(() => ({
  ...props.fade ? { align: "center", containScroll: false } : {},
  ...rootProps.value,
  axis: props.orientation === "horizontal" ? "x" : "y",
  direction: dir.value === "rtl" ? "rtl" : "ltr"
}));
```

- **Plugins 动态加载**：`autoplay/autoScroll/autoHeight/classNames/fade/wheelGestures` 会在 watch 中按需 import，并在变更时 `reInit`。

```js
async function loadPlugins() {
  const emblaPlugins = [];
  if (props.autoplay) {
    const AutoplayPlugin = await import("embla-carousel-autoplay").then((r) => r.default);
    emblaPlugins.push(AutoplayPlugin(typeof props.autoplay === "boolean" ? {} : props.autoplay));
  }
  // ... autoScroll / autoHeight / classNames / fade / wheelGestures ...
  plugins.value = emblaPlugins;
}
watch(() => [props.autoplay, props.autoScroll, props.autoHeight, props.classNames, props.fade, props.wheelGestures], async () => {
  await loadPlugins();
  emblaApi.value?.reInit(options.value, plugins.value);
}, { immediate: true });
```

- **Template 结构**：`root -> viewport -> container -> item`，以及 `arrows/dots` controls。

```vue
<Primitive
  :as="as"
  role="region"
  aria-roledescription="carousel"
  :data-orientation="orientation"
  tabindex="0"
  :class="ui.root({ class: [props.ui?.root, props.class] })"
  @keydown="onKeyDown"
>
  <div ref="emblaRef" :class="ui.viewport({ class: props.ui?.viewport })">
    <div :class="ui.container({ class: props.ui?.container })">
      <div
        v-for="(item, index) in items"
        :key="index"
        v-bind="dots ? { role: 'tabpanel' } : { 'role': 'group', 'aria-roledescription': 'slide' }"
        :class="ui.item({ class: [props.ui?.item, isCarouselItem(item) && item.ui?.item, isCarouselItem(item) && item.class] })"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>

  <div v-if="arrows || dots" :class="ui.controls({ class: props.ui?.controls })">
    <!-- arrows / dots -->
  </div>
</Primitive>
```

### 2.2 项目内封装

- `app/components/content/carousel/ProseCarousel.vue`
- `app/components/content/carousel/triggers/ProseCarouselTriggerTabs.vue`
- `app/components/content/carousel/triggers/ProseCarouselTriggerDots.vue`
- `app/components/content/carousel/triggers/ProseCarouselTriggerThumbnails.vue`
- `app/components/content/carousel/triggers/ProseCarouselTriggerNumbers.vue`
- `app/components/content/carousel/triggers/ProseCarouselTriggerProgress.vue`

## 3. Props / Slots / Events

### 3.1 `UCarousel`（Nuxt UI）

#### Props（常用）

- `items`: 轮播数据源，默认 slot 里渲染每个 item
- `orientation`: `'horizontal' | 'vertical'`（vertical 需要给 `ui.container` 指定高度）
- `arrows`: 是否显示 prev/next
- `dots`: 是否显示 dots
- `loop`: 是否循环
- Plugins（布尔或配置对象）：
  - `autoplay`
  - `auto-scroll`
  - `auto-height`
  - `fade`
  - `wheel-gestures`
  - `class-names`
- `ui`: 覆盖内部 slots 的 class（如 `container`, `item`, `dots`, `dot` 等）

#### Slots

- `#default="{ item, index }"`：渲染 item 内容

#### Emits

- `@select="(selectedIndex) => {}"`：当前选中 slide 变化

#### Expose

- `emblaApi`: `Ref<EmblaCarouselType | null>`（用于 `scrollTo`、读取 plugins 等）

### 3.2 `ProseCarousel`（项目封装）

#### Props

- `variant`: `'tabs' | 'dots' | 'thumbnails' | 'numbers' | 'progress' | 'none'`
- `tabs.orientation`: `'horizontal' | 'vertical'`
- `triggerPlacement`: `'top' | 'bottom' | 'left' | 'right' | 'auto'`
  - `auto`：`tabs + vertical => left`，其它 `bottom`
- `carouselProps`: 透传给 `UCarousel`
- `pauseOnInteraction`: 触发 select 时是否停止 autoplay（默认 true）

#### Slots

- `#slide-1` / `#slide-2` / ...：每个 slide 的内容（推荐）
- `#default`：兼容（无命名 slots 时视为单张 slide）
- `#footer`：预留 footer（非 scoped，MDC 友好）

#### Expose

- `emblaApi`
- `activeIndex`
- `totalSlides`
- `select(index)`

## 4. 主题配置（样式 / slots / variants）

Nuxt UI 默认 theme 在本项目的 **#build 输出**中可直接读取：`.nuxt/ui/carousel.ts`。

### 4.1 默认 slots

```ts
export default {
  "slots": {
    "root": "relative focus:outline-none",
    "viewport": "overflow-hidden",
    "container": "flex items-start",
    "item": "min-w-0 shrink-0 basis-full",
    "controls": "",
    "arrows": "",
    "prev": "absolute rounded-full",
    "next": "absolute rounded-full",
    "dots": "absolute inset-x-0 -bottom-7 flex flex-wrap items-center justify-center gap-3",
    "dot": [
      "cursor-pointer size-3 bg-accented rounded-full",
      "transition"
    ]
  },
  // ...
}
```

### 4.2 variants：orientation / active

```ts
  "variants": {
    "orientation": {
      "vertical": {
        "container": "flex-col -mt-4",
        "item": "pt-4",
        "prev": "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        "next": "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90"
      },
      "horizontal": {
        "container": "flex-row -ms-4",
        "item": "ps-4",
        "prev": "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        "next": "end-4 sm:-end-12 top-1/2 -translate-y-1/2"
      }
    },
    "active": {
      "true": {
        "dot": "data-[state=active]:bg-inverted"
      }
    }
  }
}
```

> 项目侧推荐通过 `carouselProps.ui` 做局部覆盖；若要全站统一风格，再考虑在 `app.config.ts` 覆盖 `ui.carousel`。

## 5. 自定义实现方案（本项目）

### 5.1 为什么不直接用 `UCarousel` 的 dots/tabs？

`UCarousel` 的 dots/arrows 很适合常规场景，但我们这里需要：

- `tabs`/`thumbnails`/`numbers` 等更复杂的 triggers（并与 Nuxt Content MDC 的 `#slide-n` 结构对齐）
- vertical tabs 与 slides 并排、同高、铺满高度（并支持滚动）
- 统一在一处处理 `pauseOnInteraction` 等业务行为

因此保留 `UCarousel` 作为“滑动引擎”，并在外层封装 `ProseCarousel`。

### 5.2 vertical tabs 同高并排的关键点

- `ProseCarousel` 内容行使用 `flex`，当 placement 为 left/right 时 `items-stretch`
- triggers 容器 `self-stretch min-h-0`，内部 trigger 组件用 `h-full min-h-0 overflow-y-auto`
- `UTabs`（Nuxt UI）在 vertical 时：
  - 外层容器 `h-full` 让 list 能撑满高度
  - trigger 不能被 `items-stretch` 拉高：设置 `flex-none shrink-0 h-auto`

## 6. 参考链接

- Nuxt UI Carousel：`https://ui.nuxt.com/docs/components/carousel`
- Embla Carousel：`https://www.embla-carousel.com/`
- Embla Plugins（Autoplay/Auto Height/Fade 等）：`https://www.embla-carousel.com/plugins/`


