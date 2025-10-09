import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "tbl_users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "photo",
        "birthcertificate",
        "transcript",
        "charactercertificate",
        "citizenship",
        "pan",
        'other'
      ),
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "tbl_documents",
    timestamps: false,
  }
);

export default Document;