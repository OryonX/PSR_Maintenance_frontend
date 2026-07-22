import React from 'react'
import { Shield, Zap, Award, Star } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation.js'

const badgeConfig = {
  'gas-safe': {
    icon: Zap,
    labelKey: 'trustBadges.gasSafe',
    color: 'bg-red-100 text-red-700 border-red-200',
    iconColor: 'text-red-600'
  },
  'part-p': {
    icon: Award,
    labelKey: 'trustBadges.partP',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600'
  },
  'insured': {
    icon: Shield,
    labelKey: 'trustBadges.insured',
    color: 'bg-green-100 text-green-700 border-green-200',
    iconColor: 'text-green-600'
  },
  'trustmark': {
    icon: Star,
    labelKey: 'trustBadges.trustmark',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    iconColor: 'text-amber-600'
  }
}

function TrustBadge({ type, size = 'md' }) {
  const { t } = useTranslation('common')
  const config = badgeConfig[type]
  if (!config) return null

  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span className={`inline-flex items-center rounded-lg border font-medium ${config.color} ${sizeClasses[size]}`}>
      <Icon className={`${config.iconColor} ${iconSizes[size]}`} />
      {t(config.labelKey)}
    </span>
  )
}

export default TrustBadge
