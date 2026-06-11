import React, { useState } from "react";
import { ImageBackground, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "../theme";
import { AppLogo, AppText, CenteredScrollView, LabeledInput, LoadingBlock, LocaleBadge, PageContent, PrimaryButton } from "../components";

export function SplashScreen({ copy }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#060608", justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}>
      <View style={{ position: "absolute", width: 320, height: 320, borderRadius: 999, backgroundColor: "rgba(255,215,0,0.08)" }} />
      <View style={{ marginBottom: 18, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.02)", ...SHADOWS.gold }}>
        <AppLogo width={220} height={110} />
      </View>
      <AppText family="inter" weight="medium" style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 56 }}>
        {copy.readyMvp}
      </AppText>
      <LoadingBlock color={COLORS.gold} />
    </View>
  );
}

export function OnboardingScreen({ copy, step, navigation }) {
  const insets = useSafeAreaInsets();
  const screens = [
    {
      title: copy.onboarding1Title,
      sub: copy.onboarding1Sub,
      cta: copy.onboarding1Cta,
      image: copy.onboarding1Image,
      colors: ["#1A1A1A", "#080808"],
    },
    {
      title: copy.onboarding2Title,
      sub: copy.onboarding2Sub,
      cta: copy.onboarding2Cta,
      image: copy.onboarding2Image,
      colors: ["#141824", "#080808"],
    },
    {
      title: copy.onboarding3Title,
      sub: copy.onboarding3Sub,
      cta: copy.onboarding3Cta,
      image: copy.onboarding3Image,
      colors: ["#1A1410", "#080808"],
    },
  ];
  const current = screens[step - 1];
  const hasImage = Boolean(typeof current.image === "string" && current.image.trim());
  const handleContinue = () => {
    if (step === 3) {
      navigation.completeOnboarding();
      return;
    }

    const nextRoute = step === 1 ? "onboarding-2" : "onboarding-3";
    navigation.replace(nextRoute);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.screenBlack }}>
      <LinearGradient colors={current.colors} style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: insets.top }}>
        {hasImage ? (
          <ImageBackground
            source={{ uri: current.image }}
            resizeMode="cover"
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <LinearGradient colors={["rgba(6,6,8,0.18)", "rgba(6,6,8,0.68)", "rgba(6,6,8,0.92)"]} style={{ flex: 1 }} />
          </ImageBackground>
        ) : null}
        <AppText family="inter" weight="medium" style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", textTransform: "uppercase", letterSpacing: 1.8 }}>
          {copy.onboardingBadge}
        </AppText>
        <LinearGradient colors={["transparent", COLORS.screenBlack]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }} />
      </LinearGradient>

      <PageContent style={{ paddingHorizontal: 28, paddingTop: 32, paddingBottom: Math.max(insets.bottom, 28) + 20 }}>
        <AppText family="sora" weight="black" style={{ color: COLORS.white, fontSize: 38, lineHeight: 40, letterSpacing: -1.7, marginBottom: 16 }}>
          {current.title}
        </AppText>
        <AppText family="inter" style={{ color: "rgba(255,255,255,0.54)", fontSize: 15, lineHeight: 26, marginBottom: 36 }}>
          {current.sub}
        </AppText>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={{ flex: index === step ? 1.5 : 1, height: 4, borderRadius: 999, backgroundColor: index === step ? COLORS.gold : "rgba(255,255,255,0.15)" }} />
          ))}
        </View>
        <PrimaryButton variant="gold" onPress={handleContinue}>
          {current.cta} →
        </PrimaryButton>
      </PageContent>
    </View>
  );
}

export function LanguageScreen({ copy, languages, navigation, selectedLanguage, setSelectedLanguage }) {
  const insets = useSafeAreaInsets();

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) + 16 }}>
        <View style={{ marginBottom: 36 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gold, textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 12 }}>
            {copy.language}
          </AppText>
          <AppText family="sora" weight="extrabold" style={{ fontSize: 34, lineHeight: 38, color: COLORS.black, letterSpacing: -1.4 }}>
            {copy.chooseLanguage}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          {languages.map((language) => {
            const active = selectedLanguage === language.api_code;
            return (
              <Pressable
                key={language.api_code}
                onPress={() => setSelectedLanguage(language.api_code)}
                style={{ paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: active ? COLORS.gold : COLORS.gray200, backgroundColor: active ? "rgba(255,215,0,0.06)" : COLORS.white, flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <LocaleBadge value={language.flag} />
                <AppText family="sora" weight="semibold" style={{ flex: 1, fontSize: 16, color: COLORS.black }}>
                  {language.label}
                </AppText>
                {active ? <Ionicons name="checkmark" size={18} color={COLORS.gold} /> : null}
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton variant="dark" style={{ marginTop: 24 }} onPress={() => navigation.afterLanguageConfirm()}>
          {copy.confirmLanguage}
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function LoginScreen({
  copy,
  error,
  form,
  mode,
  navigation,
  onForgotPassword,
  onSubmit,
  onToggleMode,
  submitting,
  updateField,
}) {
  const insets = useSafeAreaInsets();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isReset = mode === "reset";

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 28, paddingTop: insets.top + 28, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <View style={{ marginBottom: 32 }}>
          <AppLogo width={168} height={84} />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {[
            { key: "signin", label: copy.signIn },
            { key: "signup", label: copy.createAccount },
          ].map((item) => {
            const active = isReset ? item.key === "signin" : mode === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => onToggleMode(item.key)}
                style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", backgroundColor: active ? COLORS.black : COLORS.gray100 }}
              >
                <AppText family="inter" weight="bold" style={{ fontSize: 14, color: active ? COLORS.white : COLORS.gray700 }}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText family="sora" weight="extrabold" style={{ fontSize: 32, color: COLORS.black, letterSpacing: -1.2, marginBottom: 8 }}>
          {isReset ? copy.forgotPassword : mode === "signin" ? copy.welcomeBack : copy.createAccount}
        </AppText>
        <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray500, marginBottom: 28 }}>
          {isReset ? copy.passwordResetSent : mode === "signin" ? copy.signInHint : copy.registerHint}
        </AppText>

        <View style={{ gap: 14, marginBottom: 20 }}>
          {mode === "signup" ? (
            <>
              <LabeledInput label={copy.fullName} value={form.fullName} onChangeText={(value) => updateField("fullName", value)} />
              <LabeledInput label={copy.phone} value={form.phone} onChangeText={(value) => updateField("phone", value)} keyboardType="phone-pad" />
            </>
          ) : null}
          <LabeledInput label={copy.email} value={form.email} onChangeText={(value) => updateField("email", value)} keyboardType="email-address" autoCapitalize="none" editable={!isReset} />
          <LabeledInput
            label={copy.password}
            value={form.password}
            onChangeText={(value) => updateField("password", value)}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            rightIcon={passwordVisible ? "eye-off-outline" : "eye-outline"}
            onRightPress={() => setPasswordVisible((current) => !current)}
          />
        </View>

        {mode === "signin" ? (
          <Pressable style={{ alignSelf: "flex-end", marginBottom: 24 }} onPress={onForgotPassword}>
            <AppText family="inter" weight="medium" style={{ fontSize: 13, color: COLORS.black }}>
              {copy.forgotPassword}
            </AppText>
          </Pressable>
        ) : null}

        {error ? (
          <View style={{ marginBottom: 18, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <PrimaryButton variant="dark" onPress={onSubmit} disabled={submitting}>
          {submitting ? copy.loading : isReset ? `${copy.save} →` : mode === "signin" ? `${copy.signIn} →` : `${copy.createAccount} →`}
        </PrimaryButton>

        <Pressable style={{ marginTop: 18, alignSelf: "center" }} onPress={() => navigation.goBack()}>
          <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500 }}>
            {copy.back}
          </AppText>
        </Pressable>
      </PageContent>
    </CenteredScrollView>
  );
}
