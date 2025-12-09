import { StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: spacing.lg,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -48, // Compense la largeur du bouton retour pour centrer parfaitement
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120, // Espace pour la miniature du panier + marge supplémentaire
  },
  productsContainer: {
    padding: spacing.lg,
  },
  // Styles pour produits AVEC images
  productCardWithImage: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  productImageBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  popularBadgeFloating: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,215,0,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 10,
  },
  popularTextFloating: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.black,
  },
  imageContentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    zIndex: 5,
  },
  productNameOverlay: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  productDescriptionOverlay: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
    marginBottom: spacing.sm,
  },
  priceOverlayContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  productPriceOverlay: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productInfoDetailed: {
    padding: spacing.lg,
  },
  addToCartButtonStyled: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: spacing.md,
  },
  addToCartGradientStyled: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartContentStyled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addToCartTextStyled: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },

  // Styles pour produits SANS images  
  productCardNoImage: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.neutral.gray100,
  },
  noImageHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  noImageHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  noImageEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noImageEmoji: {
    fontSize: 24,
  },
  noImageTitleSection: {
    flex: 1,
    gap: spacing.xs,
  },
  productNameNoImage: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  popularBadgeNoImage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  popularTextNoImage: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray700,
  },
  productPriceNoImage: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  productInfoNoImage: {
    padding: spacing.lg,
  },
  productDescriptionNoImage: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },

  // Styles communs (anciens styles)
  productCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.neutral.gray100,
  },
  productInfo: {
    padding: spacing.lg,
    paddingRight: 60, // Espace pour le bouton
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: colors.accent.main,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  popularText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  productPrice: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  addToCartContainer: {
    marginTop: spacing.md,
  },
  quantityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  quantityBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
    textAlign: 'center',
  },
  addToCartButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addToCartButtonActive: {
    // Style actif géré par le gradient
  },
  addToCartGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addToCartText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  addedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addedText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  sizeSelector: {
    marginBottom: spacing.sm,
  },
  sizeLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sizeButtonsGrid: {
    gap: spacing.xs,
  },
  sizeButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-start',
  },
  sizeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  sizeButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  sizeButtonText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  sizeButtonTextActive: {
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.bold,
  },

  // Styles pour les personnalisations
  customizationContainer: {
    marginTop: spacing.md,
  },
  customizationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  customizationToggleText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    flex: 1,
    paddingRight: spacing.md,
  },
  customizationOptions: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customizationCategory: {
    marginBottom: spacing.xs / 2,
    marginTop: spacing.lg,
  },
  requiredLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  popularLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  customizationOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customizationOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customizationOptionName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
  },
  customizationOptionNameSelected: {
    color: '#000000',
    fontFamily: typography.fontFamily.semibold,
  },
  customizationOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customizationOptionPrice: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
  },
  customizationCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizationCheckboxSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  customizedAddToCartButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  customizedAddToCartButtonDisabled: {
    opacity: 0.5,
  },
  customizedAddToCartGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizedAddToCartText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  // Styles pour l'animation d'ajout au panier
  animatedItem: {
    position: 'absolute',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  animatedItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  animatedItemIcon: {
    marginRight: spacing.xs,
  },
  animatedItemText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
    maxWidth: 120,
  },


  // Styles pour le modal d'image
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Styles pour les animations d'arrière-plan
  backgroundAnimation1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -40,
    right: -40,
    zIndex: -2,
  },
  backgroundAnimation2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: 120,
    left: -60,
    zIndex: -2,
  },
  backgroundAnimation3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: '35%',
    right: -20,
    zIndex: -2,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: 0,
  },
  emojiText: {
    fontSize: 28,
  },

  // Styles pour la modal de commentaire
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
  },
  commentModalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  commentModalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.main,
  },
  commentModalCloseButton: {
    padding: spacing.xs,
  },
  commentProductInfo: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  commentProductImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  commentProductDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  commentProductName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  commentProductPrice: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary.main,
  },
  commentInputContainer: {
    padding: spacing.lg,
  },
  commentInputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  commentInputSubtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray500,
    marginBottom: spacing.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary.main,
    minHeight: 80,
    maxHeight: 120,
  },
  commentCharCount: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray400,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  commentModalButtons: {
    flexDirection: 'column',
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  commentCancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentCancelText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray700,
  },
  commentConfirmButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  commentConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    minHeight: 56,
  },
  commentConfirmText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },

  // Styles pour la carte unique (bowls et tacos)
  singleCardContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  singleCardImageContainer: {
    position: 'relative',
  },
  singleCardImage: {
    width: '100%',
    height: 200,
  },
  singleCardHeader: {
    padding: spacing.lg,
  },
  singleCardHeaderWithImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.xl,
  },
  singleCardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singleCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  singleCardEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  singleCardTitleContainer: {
    flex: 1,
  },
  singleCardTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
  },
  singleCardSubtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  singleCardPriceContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  singleCardPrice: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },

  // Styles pour la section des tailles
  sizesSection: {
    padding: spacing.lg,
    backgroundColor: colors.neutral.gray50,
  },
  sizesSectionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizeOption: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    minWidth: 80,
  },
  sizeOptionSelected: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.secondary.main + '10',
  },
  sizeOptionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  sizeOptionTextSelected: {
    color: colors.secondary.main,
    fontFamily: typography.fontFamily.bold,
  },
  sizeOptionPrice: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },
  sizeOptionPriceSelected: {
    color: colors.secondary.main,
    fontFamily: typography.fontFamily.bold,
  },

  // Styles pour la section de personnalisation
  customizationSection: {
    padding: spacing.lg,
  },
  customizationCategoryHeader: {
    marginBottom: spacing.xs / 2,
  },
  customizationCategoryTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs / 2,
  },
  selectionCounter: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.accent.main,
  },
  customizationCategorySubtitle: {
    marginBottom: spacing.xs,
  },
  customizationCategorySubtitleText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  customizationHelperText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  customizationRequired: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.status.success,
  },
  customizationOptions: {
    gap: spacing.xs,
  },
  customizationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
  },
  customizationOptionSelected: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.secondary.main + '10',
  },
  customizationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customizationOptionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    flex: 1,
  },
  customizationOptionTextSelected: {
    color: colors.secondary.main,
    fontFamily: typography.fontFamily.bold,
  },
  customizationOptionPopular: {
    fontSize: typography.fontSizes.xs,
    marginLeft: spacing.xs,
  },
  customizationOptionPrice: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },
  customizationOptionPriceSelected: {
    color: colors.secondary.main,
    fontFamily: typography.fontFamily.bold,
  },
  customizationOptionDisabled: {
    opacity: 0.5,
  },

  // Styles pour le footer de la carte
  singleCardFooter: {
    padding: spacing.lg,
    backgroundColor: colors.neutral.gray50,
  },
  singleCardAddButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  singleCardAddButtonDisabled: {
    opacity: 0.6,
  },
  singleCardAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  singleCardAddButtonIcon: {
    marginRight: spacing.xs,
  },
  singleCardAddButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
});


export default styles;
