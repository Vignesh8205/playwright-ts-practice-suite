/**
 * FRAMEWORK: pages/index.ts
 * Barrel export for all Page Objects.
 * Allows: import { LoginPage, DashboardPage } from "@framework/pages"
 */
export { BasePage } from "./BasePage";
export { TextBoxPage, type TextBoxFormData, type TextBoxOutput } from "./TextBoxPage";
export { CheckBoxPage } from "./CheckBoxPage";
export { RadioButtonPage, type RadioOption } from "./RadioButtonPage";
