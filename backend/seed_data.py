"""
Seed data script - Populates the database with sample HCP data for demo.
Run this script to create demo HCPs and sample interactions.
"""

from datetime import datetime, timedelta
from database import SessionLocal, init_db
from models import HCP, Interaction

# Sample HCP Data (realistic pharmaceutical/healthcare data)
SAMPLE_HCPS = [
    {
        "first_name": "Dr. Sarah",
        "last_name": "Mitchell",
        "specialty": "Cardiology",
        "hospital": "Mayo Clinic",
        "territory": "Northeast",
        "city": "Rochester",
        "state": "Minnesota",
        "email": "s.mitchell@mayoclinic.org",
        "phone": "+1-507-284-2511",
        "npi_number": "1234567890",
        "notes": "Key opinion leader in heart failure management. Interested in novel anticoagulants."
    },
    {
        "first_name": "Dr. James",
        "last_name": "Chen",
        "specialty": "Oncology",
        "hospital": "Memorial Sloan Kettering",
        "territory": "Northeast",
        "city": "New York",
        "state": "New York",
        "email": "j.chen@mskcc.org",
        "phone": "+1-212-639-2000",
        "npi_number": "2345678901",
        "notes": "Leading researcher in immunotherapy. Participates in multiple clinical trials."
    },
    {
        "first_name": "Dr. Emily",
        "last_name": "Rodriguez",
        "specialty": "Endocrinology",
        "hospital": "Cleveland Clinic",
        "territory": "Midwest",
        "city": "Cleveland",
        "state": "Ohio",
        "email": "e.rodriguez@clevelandclinic.org",
        "phone": "+1-216-444-2200",
        "npi_number": "3456789012",
        "notes": "Diabetes management specialist. High prescriber of GLP-1 agonists."
    },
    {
        "first_name": "Dr. Michael",
        "last_name": "Patel",
        "specialty": "Neurology",
        "hospital": "Johns Hopkins Hospital",
        "territory": "Mid-Atlantic",
        "city": "Baltimore",
        "state": "Maryland",
        "email": "m.patel@jhmi.edu",
        "phone": "+1-410-955-5000",
        "npi_number": "4567890123",
        "notes": "Specializes in multiple sclerosis and migraine. Interested in new biologics."
    },
    {
        "first_name": "Dr. Lisa",
        "last_name": "Thompson",
        "specialty": "Rheumatology",
        "hospital": "Stanford Medical Center",
        "territory": "West",
        "city": "Stanford",
        "state": "California",
        "email": "l.thompson@stanford.edu",
        "phone": "+1-650-723-4000",
        "npi_number": "5678901234",
        "notes": "Active researcher in autoimmune diseases. Early adopter of JAK inhibitors."
    },
    {
        "first_name": "Dr. Robert",
        "last_name": "Kim",
        "specialty": "Pulmonology",
        "hospital": "Massachusetts General Hospital",
        "territory": "Northeast",
        "city": "Boston",
        "state": "Massachusetts",
        "email": "r.kim@mgh.harvard.edu",
        "phone": "+1-617-726-2000",
        "npi_number": "6789012345",
        "notes": "COPD and asthma specialist. Interested in biologic therapies for severe asthma."
    },
    {
        "first_name": "Dr. Amanda",
        "last_name": "Foster",
        "specialty": "Dermatology",
        "hospital": "UCSF Medical Center",
        "territory": "West",
        "city": "San Francisco",
        "state": "California",
        "email": "a.foster@ucsf.edu",
        "phone": "+1-415-476-1000",
        "npi_number": "7890123456",
        "notes": "Psoriasis expert. Active in clinical trials for IL-17 and IL-23 inhibitors."
    },
    {
        "first_name": "Dr. David",
        "last_name": "Nguyen",
        "specialty": "Gastroenterology",
        "hospital": "Mount Sinai Hospital",
        "territory": "Northeast",
        "city": "New York",
        "state": "New York",
        "email": "d.nguyen@mountsinai.org",
        "phone": "+1-212-241-6500",
        "npi_number": "8901234567",
        "notes": "IBD specialist. High volume prescriber. Interested in biosimilars."
    },
]

# Sample Interactions
SAMPLE_INTERACTIONS = [
    {
        "hcp_index": 0,  # Dr. Sarah Mitchell
        "interaction_date": datetime.utcnow() - timedelta(days=3),
        "interaction_type": "In-Person",
        "channel": "Clinic Visit",
        "products_discussed": ["CardioGuard XR", "ThromboClear"],
        "key_topics": ["Heart failure management", "Novel anticoagulant efficacy data", "Patient adherence"],
        "notes": "Visited Dr. Mitchell at her clinic. She was very interested in the latest Phase III trial results for CardioGuard XR. She mentioned that several of her patients are struggling with current anticoagulant regimens. She requested additional clinical data and samples.",
        "ai_summary": "Productive meeting with Dr. Mitchell focused on CardioGuard XR Phase III data. Strong interest in switching patients from current anticoagulants. Requested samples and clinical data package.",
        "sentiment": "Positive",
        "sentiment_score": 0.85,
        "follow_up_actions": ["Send Phase III clinical data packet", "Deliver CardioGuard XR samples", "Schedule follow-up in 2 weeks"],
        "outcome": "Sample Requested",
    },
    {
        "hcp_index": 1,  # Dr. James Chen
        "interaction_date": datetime.utcnow() - timedelta(days=7),
        "interaction_type": "Virtual",
        "channel": "Zoom",
        "products_discussed": ["ImmunoBoost", "OncoShield"],
        "key_topics": ["Immunotherapy combination trials", "PD-L1 expression data", "Patient selection criteria"],
        "notes": "Virtual meeting with Dr. Chen to discuss the ImmunoBoost clinical data. He was interested but cautious about the patient selection criteria. He wants to see more real-world evidence before committing to a trial.",
        "ai_summary": "Dr. Chen showed measured interest in ImmunoBoost. Wants more real-world evidence and clearer patient selection criteria before trial participation.",
        "sentiment": "Neutral",
        "sentiment_score": 0.55,
        "follow_up_actions": ["Prepare real-world evidence summary", "Send patient selection guidelines", "Invite to upcoming KOL webinar"],
        "outcome": "Info Shared",
    },
    {
        "hcp_index": 2,  # Dr. Emily Rodriguez
        "interaction_date": datetime.utcnow() - timedelta(days=1),
        "interaction_type": "Phone",
        "channel": "Phone Call",
        "products_discussed": ["GlucoBalance Pro", "InsulinSmart"],
        "key_topics": ["GLP-1 agonist efficacy", "A1C reduction data", "Insurance coverage"],
        "notes": "Called Dr. Rodriguez to discuss the new GlucoBalance Pro formulation. She was very enthusiastic about the improved A1C reduction data. Main concern was insurance coverage for her patients. She agreed to present our data at the next diabetes conference.",
        "ai_summary": "Highly positive call with Dr. Rodriguez. Enthusiastic about GlucoBalance Pro A1C data. Agreed to present at upcoming conference. Insurance coverage is the main barrier.",
        "sentiment": "Positive",
        "sentiment_score": 0.92,
        "follow_up_actions": ["Send insurance coverage guide", "Prepare conference presentation materials", "Connect with medical affairs team"],
        "outcome": "Conference Presentation",
    },
]


def seed_database():
    """Populate the database with sample data."""
    init_db()
    db = SessionLocal()

    try:
        # Check if data already exists
        existing_hcps = db.query(HCP).count()
        if existing_hcps > 0:
            print(f"[WARN] Database already has {existing_hcps} HCPs. Skipping seed.")
            return

        # Create HCPs
        hcp_objects = []
        for hcp_data in SAMPLE_HCPS:
            hcp = HCP(**hcp_data)
            db.add(hcp)
            hcp_objects.append(hcp)

        db.commit()

        # Refresh to get IDs
        for hcp in hcp_objects:
            db.refresh(hcp)

        print(f"[OK] Created {len(hcp_objects)} sample HCPs")

        # Create Interactions
        for interaction_data in SAMPLE_INTERACTIONS:
            hcp_index = interaction_data.pop("hcp_index")
            interaction_data["hcp_id"] = hcp_objects[hcp_index].id
            interaction = Interaction(**interaction_data)
            db.add(interaction)

        db.commit()
        print(f"[OK] Created {len(SAMPLE_INTERACTIONS)} sample interactions")
        print("\n[DONE] Database seeded successfully!")
        print("\nSample HCPs:")
        for hcp in hcp_objects:
            print(f"  - {hcp.first_name} {hcp.last_name} ({hcp.specialty}) -- ID: {hcp.id}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
