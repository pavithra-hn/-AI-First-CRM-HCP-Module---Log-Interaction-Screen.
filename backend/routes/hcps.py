"""
HCP API Routes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from database import get_db
import crud
from schemas import HCPCreate, HCPUpdate, HCPResponse

router = APIRouter(prefix="/api/hcps", tags=["HCPs"])


@router.get("", response_model=None)
def list_hcps(
    search: Optional[str] = Query(None, description="Search term"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """List all HCPs or search by name/specialty/hospital."""
    if search:
        hcps = crud.search_hcps(db, search)
    else:
        hcps = crud.get_hcps(db, skip=skip, limit=limit)
    return [hcp.to_dict() for hcp in hcps]


@router.get("/{hcp_id}", response_model=None)
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    """Get a single HCP with their interaction history."""
    hcp = crud.get_hcp(db, hcp_id)
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    result = hcp.to_dict()
    result["interactions"] = [i.to_dict() for i in hcp.interactions]
    return result


@router.post("", response_model=None, status_code=201)
def create_hcp(hcp: HCPCreate, db: Session = Depends(get_db)):
    """Create a new HCP."""
    new_hcp = crud.create_hcp(db, hcp)
    return new_hcp.to_dict()


@router.put("/{hcp_id}", response_model=None)
def update_hcp(hcp_id: int, hcp_update: HCPUpdate, db: Session = Depends(get_db)):
    """Update an existing HCP."""
    updated = crud.update_hcp(db, hcp_id, hcp_update)
    if not updated:
        raise HTTPException(status_code=404, detail="HCP not found")
    return updated.to_dict()


@router.delete("/{hcp_id}")
def delete_hcp(hcp_id: int, db: Session = Depends(get_db)):
    """Delete an HCP."""
    success = crud.delete_hcp(db, hcp_id)
    if not success:
        raise HTTPException(status_code=404, detail="HCP not found")
    return {"message": "HCP deleted successfully"}
