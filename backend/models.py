from datetime import datetime, date
from uuid import uuid4

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Numeric, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from database import Base


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(Integer, primary_key=True)
    neq = Column(String(10), unique=True, nullable=True)
    licence_rbq = Column(String(15), nullable=True)
    nom_legal = Column(String(255), nullable=False)
    nom_normalized = Column(String(255), nullable=True)
    adresse = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=True)
    code_postal = Column(String(7), nullable=True)
    telephone = Column(String(20), nullable=True)
    forme_juridique = Column(String(50), nullable=True)
    date_fondation = Column(Date, nullable=True)
    statut_req = Column(String(30), nullable=True)
    statut_rbq = Column(String(30), nullable=True)
    categories_rbq = Column(ARRAY(Text), nullable=True)
    score = Column(Integer, nullable=True)
    score_updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    events = relationship("RBQEvent", back_populates="contractor")
    plaintes = relationship("OPCPlainte", back_populates="contractor", uselist=False)
    litiges = relationship("Litige", back_populates="contractor")
    contrats = relationship("SEAOContract", back_populates="contractor")


class RBQEvent(Base):
    __tablename__ = "rbq_events"

    id = Column(Integer, primary_key=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    event_type = Column(String(50), nullable=True)
    event_date = Column(Date, nullable=True)
    montant = Column(Numeric(12, 2), nullable=True)
    description = Column(Text, nullable=True)
    source = Column(String(20), default="rbq")
    created_at = Column(DateTime, default=datetime.utcnow)

    contractor = relationship("Contractor", back_populates="events")


class OPCPlainte(Base):
    __tablename__ = "opc_plaintes"

    id = Column(Integer, primary_key=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    nb_plaintes = Column(Integer, default=0)
    mises_en_garde = Column(ARRAY(Text), nullable=True)
    types_infractions = Column(ARRAY(Text), nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    contractor = relationship("Contractor", back_populates="plaintes")


class Litige(Base):
    __tablename__ = "litiges"

    id = Column(Integer, primary_key=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    source = Column(String(20), nullable=True)
    tribunal = Column(String(100), nullable=True)
    date_decision = Column(Date, nullable=True)
    type_litige = Column(String(100), nullable=True)
    issue = Column(String(50), nullable=True)
    montant = Column(Numeric(12, 2), nullable=True)
    url_decision = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contractor = relationship("Contractor", back_populates="litiges")


class SEAOContract(Base):
    __tablename__ = "seao_contracts"

    id = Column(Integer, primary_key=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    titre = Column(String(500), nullable=True)
    organisme = Column(String(255), nullable=True)
    montant = Column(Numeric(14, 2), nullable=True)
    date_attribution = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contractor = relationship("Contractor", back_populates="contrats")


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    tier = Column(String(20), nullable=True)
    prix = Column(Numeric(6, 2), nullable=True)
    stripe_payment_intent = Column(String(100), nullable=True)
    statut_paiement = Column(String(20), default="pending")
    pdf_url = Column(Text, nullable=True)
    email_acheteur = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class OPCCache(Base):
    __tablename__ = "opc_cache"

    neq = Column(String(10), primary_key=True)
    data = Column(JSONB, nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)