import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";

const PrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Privacy Policy</Text>
      <Text style={styles.subHeading}>Effective Date: 14-02-2025</Text>

      <Text style={styles.paragraph}>
        Welcome to <Text style={styles.bold}>Wealth Associates!</Text> Your
        privacy is of utmost importance to us. This Privacy Policy explains how
        we collect, use, disclose, and safeguard your information when you visit
        our website{" "}
        <Text style={styles.bold}>www.wealthassociatesindia.com</Text> or
        interact with our services.
      </Text>

      <Text style={styles.title}>1. Information We Collect</Text>
      <Text style={styles.bold}>a) Personal Information</Text>
      <Text style={styles.listItem}>• Naresh paritala</Text>
      <Text style={styles.listItem}>
        • Contact details (wealthassociate.com@gmmail.com, 7796356789, etc.)
      </Text>
      <Text style={styles.listItem}>• Vijayawada</Text>
      <Text style={styles.listItem}>
        • Any other information provided via forms or inquiries
      </Text>

      <Text style={styles.bold}>b) Non-Personal Information</Text>
      <Text style={styles.listItem}>• IP address</Text>
      <Text style={styles.listItem}>• Browser type and version</Text>
      <Text style={styles.listItem}>
        • Pages visited and time spent on pages
      </Text>

      <Text style={styles.title}>2. How We Use Your Information</Text>
      <Text style={styles.listItem}>
        • Respond to inquiries and provide real estate marketing services
      </Text>
      <Text style={styles.listItem}>
        • Improve website and services through analytics
      </Text>
      <Text style={styles.listItem}>
        • Communicate updates, promotions, or newsletters (opt-in only)
      </Text>
      <Text style={styles.listItem}>
        • Ensure compliance with legal obligations
      </Text>

      <Text style={styles.title}>3. Sharing Your Information</Text>
      <Text style={styles.listItem}>
        • We do not sell, rent, or trade your personal information.
      </Text>
      <Text style={styles.listItem}>
        • Data may be shared with trusted third-party service providers (e.g.,
        hosting, analytics).
      </Text>
      <Text style={styles.listItem}>
        • We may disclose data for legal compliance or business transactions.
      </Text>

      <Text style={styles.title}>4. Cookies and Tracking Technologies</Text>
      <Text style={styles.paragraph}>
        We use cookies to improve your browsing experience. You can manage
        cookies through browser settings.
      </Text>

      <Text style={styles.title}>5. Data Security</Text>
      <Text style={styles.paragraph}>
        We implement security measures to protect personal data, but no method
        is 100% secure.
      </Text>

      <Text style={styles.title}>6. Your Rights</Text>
      <Text style={styles.listItem}>
        • Access the personal data we hold about you
      </Text>
      <Text style={styles.listItem}>
        • Request correction or deletion of your data
      </Text>
      <Text style={styles.listItem}>• Opt-out of marketing communications</Text>
      <Text style={styles.paragraph}>
        To exercise your rights, contact us at [Insert Email Address].
      </Text>

      <Text style={styles.title}>7. Links to Third-Party Websites</Text>
      <Text style={styles.paragraph}>
        We are not responsible for the privacy practices of third-party websites
        linked on our platform.
      </Text>

      <Text style={styles.title}>8. Updates to This Privacy Policy</Text>
      <Text style={styles.paragraph}>
        We may update this policy periodically. Any changes will be reflected on
        this page with an updated "Effective Date."
      </Text>

      <Text style={styles.title}>9. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have questions or concerns, reach out to:
      </Text>
      <Text style={styles.bold}>Wealth Associates</Text>
      <Text>Email: info@wealthassociatesindia.com</Text>
      <Text>Phone: 77963 56789</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#555",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    marginLeft: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
  },
});

export default PrivacyPolicy;
