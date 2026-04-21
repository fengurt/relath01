/**
 * Ant Design theme — Art Deco “Gatsby” palette (design.md).
 * Typography: Josefin Sans (body), Marcellus (display) via global.css.
 */
import type { ThemeConfig } from "antd";
import { theme } from "antd";

/** Art Deco luxury palette — obsidian, champagne, metallic gold, midnight blue */
export const RELATH_STITCH_NAMED = {
  background: "#0A0A0A",
  surface: "#141414",
  surface_container_lowest: "#050505",
  surface_container_low: "#0f0f0f",
  surface_container: "#141414",
  surface_container_high: "#1a1a1a",
  surface_container_highest: "#222222",
  surface_bright: "#2a2a2a",
  primary: "#D4AF37",
  primary_dark: "#A67C00",
  primary_light: "#F2E8C4",
  on_surface: "#F2F0E4",
  on_surface_variant: "#888888",
  outline_variant: "#3a3a3a",
  secondary: "#1E3D59",
  gold_rgba_20: "rgba(212, 175, 55, 0.2)",
  gold_rgba_35: "rgba(212, 175, 55, 0.35)",
} as const;

export const stitchRelathAntdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    borderRadius: 2,
    borderRadiusLG: 2,
    borderRadiusSM: 2,
    borderRadiusXS: 0,
    colorPrimary: RELATH_STITCH_NAMED.primary,
    colorInfo: RELATH_STITCH_NAMED.secondary,
    colorLink: RELATH_STITCH_NAMED.primary_light,
    colorSuccess: "#5a9f6e",
    colorWarning: "#c9a227",
    colorError: "#c75c5c",
    colorText: RELATH_STITCH_NAMED.on_surface,
    colorTextSecondary: RELATH_STITCH_NAMED.on_surface_variant,
    colorTextDescription: RELATH_STITCH_NAMED.on_surface_variant,
    colorTextLightSolid: RELATH_STITCH_NAMED.background,
    colorBgLayout: RELATH_STITCH_NAMED.background,
    colorBgContainer: RELATH_STITCH_NAMED.surface_container,
    colorBgElevated: RELATH_STITCH_NAMED.surface_container_high,
    colorBorder: "rgba(212, 175, 55, 0.35)",
    colorBorderSecondary: "rgba(212, 175, 55, 0.18)",
    fontFamily:
      '"Josefin Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontFamilyCode:
      '"Roboto Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
    fontSize: 15,
    lineHeight: 1.55,
    controlHeight: 48,
    controlHeightLG: 48,
    motionDurationMid: "0.35s",
    motionDurationSlow: "0.45s",
  },
  components: {
    Layout: {
      headerBg: RELATH_STITCH_NAMED.surface_container_high,
      bodyBg: RELATH_STITCH_NAMED.background,
      footerBg: RELATH_STITCH_NAMED.background,
      siderBg: "transparent",
    },
    Card: {
      borderRadiusLG: 2,
      borderRadiusSM: 2,
      headerBg: RELATH_STITCH_NAMED.surface_container_high,
      colorBgContainer: RELATH_STITCH_NAMED.surface_container_high,
      colorBorderSecondary: "rgba(212, 175, 55, 0.28)",
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "rgba(30, 61, 89, 0.35)",
      darkItemSelectedBg: "rgba(212, 175, 55, 0.12)",
      darkItemHoverBg: "rgba(212, 175, 55, 0.07)",
      darkItemSelectedColor: RELATH_STITCH_NAMED.primary,
      darkPopupBg: RELATH_STITCH_NAMED.surface_container_high,
      itemColor: RELATH_STITCH_NAMED.on_surface_variant,
      colorText: RELATH_STITCH_NAMED.on_surface,
      fontSize: 14,
      iconSize: 18,
      collapsedIconSize: 19,
      itemHeight: 46,
      itemBorderRadius: 2,
      itemMarginInline: 8,
      itemMarginBlock: 5,
      itemPaddingInline: 14,
      subMenuItemBorderRadius: 2,
      activeBarWidth: 3,
      activeBarBorderWidth: 0,
      groupTitleFontSize: 11,
      groupTitleLineHeight: 1.35,
      groupTitleColor: "rgba(212, 175, 55, 0.42)",
    },
    Table: {
      headerBg: RELATH_STITCH_NAMED.surface_container_low,
      headerColor: RELATH_STITCH_NAMED.on_surface_variant,
      headerSplitColor: "transparent",
      rowHoverBg: "rgba(212, 175, 55, 0.06)",
      colorBgContainer: RELATH_STITCH_NAMED.surface_container_low,
      borderRadius: 2,
    },
    Button: {
      primaryShadow: "0 0 18px rgba(212, 175, 55, 0.35)",
      colorPrimary: RELATH_STITCH_NAMED.primary,
      primaryColor: RELATH_STITCH_NAMED.background,
      borderRadius: 2,
      borderRadiusLG: 2,
      fontWeight: 600,
      paddingBlock: 12,
    },
    Breadcrumb: {
      fontSize: 12,
      itemColor: "rgba(242, 240, 228, 0.45)",
      lastItemColor: RELATH_STITCH_NAMED.on_surface,
      separatorColor: "rgba(212, 175, 55, 0.28)",
    },
    Input: {
      colorBgContainer: "transparent",
      hoverBg: "transparent",
      activeBg: "transparent",
      activeBorderColor: RELATH_STITCH_NAMED.primary_light,
      borderRadius: 0,
      paddingBlock: 10,
    },
    Select: {
      colorBgContainer: RELATH_STITCH_NAMED.surface_container_low,
      borderRadius: 2,
    },
    Modal: {
      contentBg: RELATH_STITCH_NAMED.surface_container_high,
      headerBg: RELATH_STITCH_NAMED.surface_container_high,
      footerBg: RELATH_STITCH_NAMED.surface_container_high,
      borderRadiusLG: 2,
    },
    Drawer: {
      colorBgElevated: RELATH_STITCH_NAMED.surface_container_high,
    },
    Pagination: {
      colorBgContainer: RELATH_STITCH_NAMED.surface_container_lowest,
      borderRadius: 2,
    },
    Alert: {
      colorInfoBg: "rgba(30, 61, 89, 0.35)",
      colorInfoBorder: "rgba(212, 175, 55, 0.28)",
    },
    Tabs: {
      borderRadius: 2,
    },
    Tag: {
      borderRadiusSM: 2,
    },
    Progress: {
      defaultColor: RELATH_STITCH_NAMED.primary,
    },
    Collapse: {
      borderRadiusLG: 2,
    },
  },
};
