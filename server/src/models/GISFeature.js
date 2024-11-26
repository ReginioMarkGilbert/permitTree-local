const mongoose = require('mongoose');

const GISFeatureSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Feature']
  },
  geometry: {
    type: {
      type: String,
      required: true,
      enum: ['Point', 'Polygon']
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function(coords) {
          if (this.geometry.type === 'Point') {
            return Array.isArray(coords) && coords.length === 2 &&
                   coords.every(coord => typeof coord === 'number');
          } else if (this.geometry.type === 'Polygon') {
            return Array.isArray(coords) && coords.length > 0 &&
                   coords.every(ring =>
                     Array.isArray(ring) && ring.length >= 4 &&
                     ring.every(coord =>
                       Array.isArray(coord) && coord.length === 2 &&
                       coord.every(num => typeof num === 'number')
                     )
                   );
          }
          return false;
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  properties: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  layerType: {
    type: String,
    required: true,
    enum: ['protectedAreas', 'forestCover', 'miningSites', 'coastalResources', 'landUse']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// virtual for id field
GISFeatureSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Include virtual properties when document is converted to JSON/Object
GISFeatureSchema.set('toJSON', { virtuals: true });
GISFeatureSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('GISFeature', GISFeatureSchema);
