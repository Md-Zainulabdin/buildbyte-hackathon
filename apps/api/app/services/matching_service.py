from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.opportunity import Opportunity, OpportunityStatus
from app.models.user import User
from app.schemas.opportunity import OpportunityResponse


async def get_matched_opportunities(db: AsyncSession, user: User) -> list[OpportunityResponse]:
    query = (
        select(Opportunity)
        .where(Opportunity.status == OpportunityStatus.open)
        .order_by(Opportunity.created_at.desc())
    )
    result = await db.execute(query)
    opportunities = result.scalars().all()

    user_skills = set(s.lower() for s in (user.skills or []))

    scored = []
    for opp in opportunities:
        score = 0
        opp_skills = set(s.lower() for s in (opp.required_skills or []))
        if user_skills and opp_skills:
            matching = user_skills & opp_skills
            score += len(matching) * 10

        if user.location and opp.location:
            if user.location.lower() == opp.location.lower():
                score += 5

        scored.append((score, opp))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [OpportunityResponse.model_validate(opp) for _, opp in scored]
