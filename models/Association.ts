import mongoose from 'mongoose';

const AssociationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date_formulated: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'archived'],
    default: 'active'
  },
  operational_reason: {
    type: String,
    default: ''
  },
  covid_affected: {
    type: Boolean,
    default: false
  },
  profit_sharing: {
    type: Boolean,
    default: false
  },
  profit_sharing_amount: {
    type: Number,
    default: 0
  },
  loan_scheme: {
    type: Boolean,
    default: false
  },
  loan_scheme_amount: {
    type: Number,
    default: 0
  },
  no_active_members: {
    type: Number,
    default: 0,
    min: 0
  },
  no_inactive_members: {
    type: Number,
    default: 0,
    min: 0
  },
  registrations_certifications: [{
    type: String
  }],
  final_org_adjectival_rating: {
    type: String,
    default: ''
  },
  final_org_rating_assessment: {
    type: String,
    default: ''
  },
  archived: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
AssociationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.Association || mongoose.model('Association', AssociationSchema);