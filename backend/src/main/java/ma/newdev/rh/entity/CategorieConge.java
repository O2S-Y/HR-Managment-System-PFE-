package ma.newdev.rh.entity;

/**
 * Catégorie métier d'un type de congé. Sert de discriminant pour les règles
 * de paie (déductions) et le calcul du solde, indépendamment du libellé
 * configurable du type de congé.
 */
public enum CategorieConge {
    ANNUEL,
    MALADIE,
    MATERNITE,
    PATERNITE,
    SANS_SOLDE,
    AUTRE
}
