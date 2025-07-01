"""
Services for Advanced Prompt Engineering Tools
"""

import json
import time
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.prompt_models import (
    PromptTemplate,
    PromptTag,
    PromptChain,
    PromptTestResult,
    ChainTestResult,
    PromptUsageAnalytics,
    ChainUsageAnalytics,
    PromptLibraryItem,
    PromptLibraryReview
)
from app.services.ai.unified_service import UnifiedAIService

# Initialize logging
logger = logging.getLogger(__name__)

# Initialize AI service
ai_service = UnifiedAIService()

class PromptTemplateService:
    """Service for managing prompt templates."""
    
    @staticmethod
    async def create_template(
        db: Session,
        title: str,
        template_text: str,
        creator_id: int,
        description: Optional[str] = None,
        variables: Optional[List[Dict[str, str]]] = None,
        default_values: Optional[Dict[str, str]] = None,
        is_public: bool = False,
        tag_ids: Optional[List[int]] = None
    ) -> PromptTemplate:
        """Create a new prompt template."""
        # Extract variables from template if not provided
        if variables is None:
            variables = PromptTemplateService._extract_variables(template_text)
        
        # Create template
        template = PromptTemplate(
            title=title,
            description=description,
            template_text=template_text,
            variables=variables,
            default_values=default_values or {},
            is_public=is_public,
            creator_id=creator_id
        )
        
        db.add(template)
        db.commit()
        
        # Add tags if provided
        if tag_ids:
            tags = db.query(PromptTag).filter(PromptTag.id.in_(tag_ids)).all()
            template.tags = tags
            db.commit()
            
        db.refresh(template)
        return template
    
    @staticmethod
    def _extract_variables(template_text: str) -> List[Dict[str, str]]:
        """Extract variables from a template string."""
        import re
        
        # Look for patterns like {{variable_name}} or {variable_name}
        pattern = r'\{\{([^}]+)\}\}|\{([^}]+)\}'
        matches = re.findall(pattern, template_text)
        
        variables = []
        seen_vars = set()
        
        for match in matches:
            # Each match is a tuple with one empty string and one variable name
            var_name = match[0] if match[0] else match[1]
            
            # Skip duplicates
            if var_name in seen_vars:
                continue
                
            seen_vars.add(var_name)
            variables.append({
                "name": var_name,
                "description": f"Value for {var_name}",
                "type": "string"
            })
            
        return variables
    
    @staticmethod
    async def get_templates(
        db: Session,
        user_id: int,
        include_public: bool = True,
        tag_ids: Optional[List[int]] = None
    ) -> List[PromptTemplate]:
        """Get all templates accessible by a user."""
        query = db.query(PromptTemplate).filter(PromptTemplate.creator_id == user_id)
        
        if include_public:
            query = query.union(
                db.query(PromptTemplate).filter(PromptTemplate.is_public == True)
            )
            
        # Filter by tags if specified
        if tag_ids:
            for tag_id in tag_ids:
                query = query.filter(PromptTemplate.tags.any(id=tag_id))
                
        return query.all()
    
    @staticmethod
    async def get_template(
        db: Session,
        template_id: int,
        user_id: int
    ) -> Optional[PromptTemplate]:
        """Get a specific template if accessible by the user."""
        template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
        
        if not template:
            return None
            
        # Check if user has access
        if template.creator_id == user_id or template.is_public:
            return template
            
        return None
    
    @staticmethod
    async def update_template(
        db: Session,
        template_id: int,
        user_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        template_text: Optional[str] = None,
        variables: Optional[List[Dict[str, str]]] = None,
        default_values: Optional[Dict[str, str]] = None,
        is_public: Optional[bool] = None,
        tag_ids: Optional[List[int]] = None
    ) -> PromptTemplate:
        """Update a prompt template."""
        template = db.query(PromptTemplate).filter(
            PromptTemplate.id == template_id,
            PromptTemplate.creator_id == user_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found or you don't have permission")
        
        # Update fields if provided
        if title is not None:
            template.title = title
        if description is not None:
            template.description = description
        if template_text is not None:
            template.template_text = template_text
            # Re-extract variables if not provided
            if variables is None:
                template.variables = PromptTemplateService._extract_variables(template_text)
        if variables is not None:
            template.variables = variables
        if default_values is not None:
            template.default_values = default_values
        if is_public is not None:
            template.is_public = is_public
            
        # Update tags if provided
        if tag_ids is not None:
            tags = db.query(PromptTag).filter(PromptTag.id.in_(tag_ids)).all()
            template.tags = tags
            
        db.commit()
        db.refresh(template)
        return template
    
    @staticmethod
    async def delete_template(
        db: Session,
        template_id: int,
        user_id: int
    ) -> bool:
        """Delete a prompt template."""
        template = db.query(PromptTemplate).filter(
            PromptTemplate.id == template_id,
            PromptTemplate.creator_id == user_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found or you don't have permission")
        
        db.delete(template)
        db.commit()
        return True
    
    @staticmethod
    async def render_template(
        template: PromptTemplate,
        variables: Dict[str, str]
    ) -> str:
        """Render a prompt template with the provided variables."""
        rendered_text = template.template_text
        
        # Replace variables in the template
        for var in template.variables:
            var_name = var["name"]
            placeholder = f"{{{{{var_name}}}}}" if "{{" in template.template_text else f"{{{var_name}}}"
            value = variables.get(var_name, template.default_values.get(var_name, f"[{var_name}]"))
            rendered_text = rendered_text.replace(placeholder, value)
            
        return rendered_text
    
    @staticmethod
    async def test_template(
        db: Session,
        template_id: int,
        user_id: int,
        variables: Dict[str, str],
        model: str,
        parameters: Dict[str, Any]
    ) -> PromptTestResult:
        """Test a prompt template with the provided variables and model."""
        # Get template
        template = await PromptTemplateService.get_template(db, template_id, user_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found or you don't have permission")
        
        # Render template
        prompt_text = await PromptTemplateService.render_template(template, variables)
        
        # Generate response using AI service
        start_time = time.time()
        try:
            response = ai_service.generate_text(
                prompt=prompt_text,
                model=model,
                **parameters
            )
            success = True
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            response = {"text": f"Error: {str(e)}"}
            success = False
            
        execution_time = time.time() - start_time
        
        # Create test result
        test_result = PromptTestResult(
            template_id=template_id,
            user_id=user_id,
            model=model,
            parameters=parameters,
            variables_used=variables,
            prompt_text=prompt_text,
            response_text=response.get("text", ""),
            execution_time=execution_time,
            rating=None,  # To be set by user later
            notes=None    # To be set by user later
        )
        
        db.add(test_result)
        db.commit()
        db.refresh(test_result)
        
        # Record usage analytics
        await PromptAnalyticsService.record_template_usage(
            db=db,
            template_id=template_id,
            user_id=user_id,
            agent_id=None,
            session_id=None,
            model=model,
            parameters=parameters,
            variables_used=variables,
            execution_time=execution_time,
            token_count=response.get("token_count", 0),
            success=success
        )
        
        return test_result
    
    @staticmethod
    async def rate_test_result(
        db: Session,
        test_result_id: int,
        user_id: int,
        rating: int,
        notes: Optional[str] = None
    ) -> PromptTestResult:
        """Rate a prompt test result."""
        test_result = db.query(PromptTestResult).filter(
            PromptTestResult.id == test_result_id,
            PromptTestResult.user_id == user_id
        ).first()
        
        if not test_result:
            raise HTTPException(status_code=404, detail="Test result not found or you don't have permission")
        
        test_result.rating = rating
        test_result.notes = notes
        
        db.commit()
        db.refresh(test_result)
        return test_result


class PromptChainService:
    """Service for managing prompt chains."""
    
    @staticmethod
    async def create_chain(
        db: Session,
        title: str,
        creator_id: int,
        description: Optional[str] = None,
        template_ids: Optional[List[int]] = None,
        is_public: bool = False
    ) -> PromptChain:
        """Create a new prompt chain."""
        chain = PromptChain(
            title=title,
            description=description,
            is_public=is_public,
            creator_id=creator_id
        )
        
        db.add(chain)
        db.commit()
        
        # Add templates if provided
        if template_ids:
            templates = db.query(PromptTemplate).filter(PromptTemplate.id.in_(template_ids)).all()
            
            # Check if user has access to all templates
            for template in templates:
                if template.creator_id != creator_id and not template.is_public:
                    raise HTTPException(status_code=403, detail=f"You don't have access to template: {template.title}")
            
            # Add templates to chain with order
            for i, template_id in enumerate(template_ids):
                # Find the template in our list
                template = next((t for t in templates if t.id == template_id), None)
                if template:
                    # Add to association table with order
                    db.execute(
                        "INSERT INTO prompt_chain_templates (prompt_chain_id, prompt_template_id, order_index) VALUES (:chain_id, :template_id, :order_index)",
                        {
                            "chain_id": chain.id,
                            "template_id": template_id,
                            "order_index": i
                        }
                    )
            
            db.commit()
            
        db.refresh(chain)
        return chain
    
    @staticmethod
    async def get_chains(
        db: Session,
        user_id: int,
        include_public: bool = True
    ) -> List[PromptChain]:
        """Get all chains accessible by a user."""
        query = db.query(PromptChain).filter(PromptChain.creator_id == user_id)
        
        if include_public:
            query = query.union(
                db.query(PromptChain).filter(PromptChain.is_public == True)
            )
                
        return query.all()
    
    @staticmethod
    async def get_chain(
        db: Session,
        chain_id: int,
        user_id: int
    ) -> Optional[PromptChain]:
        """Get a specific chain if accessible by the user."""
        chain = db.query(PromptChain).filter(PromptChain.id == chain_id).first()
        
        if not chain:
            return None
            
        # Check if user has access
        if chain.creator_id == user_id or chain.is_public:
            return chain
            
        return None
    
    @staticmethod
    async def update_chain(
        db: Session,
        chain_id: int,
        user_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        template_ids: Optional[List[int]] = None,
        is_public: Optional[bool] = None
    ) -> PromptChain:
        """Update a prompt chain."""
        chain = db.query(PromptChain).filter(
            PromptChain.id == chain_id,
            PromptChain.creator_id == user_id
        ).first()
        
        if not chain:
            raise HTTPException(status_code=404, detail="Chain not found or you don't have permission")
        
        # Update fields if provided
        if title is not None:
            chain.title = title
        if description is not None:
            chain.description = description
        if is_public is not None:
            chain.is_public = is_public
            
        # Update templates if provided
        if template_ids is not None:
            # Clear existing templates
            db.execute(
                "DELETE FROM prompt_chain_templates WHERE prompt_chain_id = :chain_id",
                {"chain_id": chain.id}
            )
            
            # Add new templates
            templates = db.query(PromptTemplate).filter(PromptTemplate.id.in_(template_ids)).all()
            
            # Check if user has access to all templates
            for template in templates:
                if template.creator_id != user_id and not template.is_public:
                    raise HTTPException(status_code=403, detail=f"You don't have access to template: {template.title}")
            
            # Add templates to chain with order
            for i, template_id in enumerate(template_ids):
                # Find the template in our list
                template = next((t for t in templates if t.id == template_id), None)
                if template:
                    # Add to association table with order
                    db.execute(
                        "INSERT INTO prompt_chain_templates (prompt_chain_id, prompt_template_id, order_index) VALUES (:chain_id, :template_id, :order_index)",
                        {
                            "chain_id": chain.id,
                            "template_id": template_id,
                            "order_index": i
                        }
                    )
            
        db.commit()
        db.refresh(chain)
        return chain
    
    @staticmethod
    async def delete_chain(
        db: Session,
        chain_id: int,
        user_id: int
    ) -> bool:
        """Delete a prompt chain."""
        chain = db.query(PromptChain).filter(
            PromptChain.id == chain_id,
            PromptChain.creator_id == user_id
        ).first()
        
        if not chain:
            raise HTTPException(status_code=404, detail="Chain not found or you don't have permission")
        
        # Clear association table entries
        db.execute(
            "DELETE FROM prompt_chain_templates WHERE prompt_chain_id = :chain_id",
            {"chain_id": chain.id}
        )
        
        db.delete(chain)
        db.commit()
        return True
    
    @staticmethod
    async def execute_chain(
        db: Session,
        chain_id: int,
        user_id: int,
        initial_variables: Dict[str, str],
        model: str,
        parameters: Dict[str, Any]
    ) -> ChainTestResult:
        """Execute a prompt chain with the provided variables and model."""
        # Get chain
        chain = await PromptChainService.get_chain(db, chain_id, user_id)
        if not chain:
            raise HTTPException(status_code=404, detail="Chain not found or you don't have permission")
        
        # Get templates in order
        templates_query = """
            SELECT pt.* FROM prompt_templates pt
            JOIN prompt_chain_templates pct ON pt.id = pct.prompt_template_id
            WHERE pct.prompt_chain_id = :chain_id
            ORDER BY pct.order_index
        """
        templates = db.execute(templates_query, {"chain_id": chain_id}).fetchall()
        
        if not templates:
            raise HTTPException(status_code=400, detail="Chain has no templates")
        
        # Execute chain
        start_time = time.time()
        current_variables = initial_variables.copy()
        intermediate_results = []
        success = True
        step_times = []
        total_tokens = 0
        
        for i, template_row in enumerate(templates):
            # Convert row to PromptTemplate object
            template = PromptTemplate(
                id=template_row[0],
                title=template_row[1],
                description=template_row[2],
                template_text=template_row[3],
                variables=template_row[4],
                default_values=template_row[5],
                is_public=template_row[6],
                created_at=template_row[7],
                updated_at=template_row[8],
                creator_id=template_row[9]
            )
            
            # Render template
            prompt_text = await PromptTemplateService.render_template(template, current_variables)
            
            # Generate response
            step_start_time = time.time()
            try:
                response = ai_service.generate_text(
                    prompt=prompt_text,
                    model=model,
                    **parameters
                )
                step_success = True
            except Exception as e:
                logger.error(f"Error in chain step {i+1}: {e}")
                response = {"text": f"Error: {str(e)}"}
                step_success = False
                success = False
                
            step_time = time.time() - step_start_time
            step_times.append(step_time)
            
            # Store result
            result = {
                "step": i + 1,
                "template_id": template.id,
                "template_title": template.title,
                "prompt": prompt_text,
                "response": response.get("text", ""),
                "execution_time": step_time,
                "success": step_success
            }
            intermediate_results.append(result)
            
            # Update variables for next step
            current_variables["previous_response"] = response.get("text", "")
            
            # Add tokens
            total_tokens += response.get("token_count", 0)
            
            # Stop if step failed
            if not step_success:
                break
                
        total_time = time.time() - start_time
        final_result = intermediate_results[-1]["response"] if intermediate_results else ""
        
        # Create test result
        test_result = ChainTestResult(
            chain_id=chain_id,
            user_id=user_id,
            model=model,
            parameters=parameters,
            input_variables=initial_variables,
            intermediate_results=intermediate_results,
            final_result=final_result,
            execution_time=total_time,
            rating=None,  # To be set by user later
            notes=None    # To be set by user later
        )
        
        db.add(test_result)
        db.commit()
        db.refresh(test_result)
        
        # Record usage analytics
        await PromptAnalyticsService.record_chain_usage(
            db=db,
            chain_id=chain_id,
            user_id=user_id,
            agent_id=None,
            session_id=None,
            model=model,
            parameters=parameters,
            input_variables=initial_variables,
            step_execution_times=step_times,
            total_execution_time=total_time,
            total_token_count=total_tokens,
            success=success
        )
        
        return test_result
    
    @staticmethod
    async def rate_chain_result(
        db: Session,
        test_result_id: int,
        user_id: int,
        rating: int,
        notes: Optional[str] = None
    ) -> ChainTestResult:
        """Rate a chain test result."""
        test_result = db.query(ChainTestResult).filter(
            ChainTestResult.id == test_result_id,
            ChainTestResult.user_id == user_id
        ).first()
        
        if not test_result:
            raise HTTPException(status_code=404, detail="Test result not found or you don't have permission")
        
        test_result.rating = rating
        test_result.notes = notes
        
        db.commit()
        db.refresh(test_result)
        return test_result


class PromptAnalyticsService:
    """Service for prompt usage analytics."""
    
    @staticmethod
    async def record_template_usage(
        db: Session,
        template_id: int,
        user_id: int,
        agent_id: Optional[int],
        session_id: Optional[int],
        model: str,
        parameters: Dict[str, Any],
        variables_used: Dict[str, str],
        execution_time: float,
        token_count: int,
        success: bool
    ) -> PromptUsageAnalytics:
        """Record usage analytics for a prompt template."""
        analytics = PromptUsageAnalytics(
            template_id=template_id,
            user_id=user_id,
            agent_id=agent_id,
            session_id=session_id,
            model=model,
            parameters=parameters,
            variables_used=variables_used,
            execution_time=execution_time,
            token_count=token_count,
            success=success
        )
        
        db.add(analytics)
        db.commit()
        db.refresh(analytics)
        return analytics
    
    @staticmethod
    async def record_chain_usage(
        db: Session,
        chain_id: int,
        user_id: int,
        agent_id: Optional[int],
        session_id: Optional[int],
        model: str,
        parameters: Dict[str, Any],
        input_variables: Dict[str, str],
        step_execution_times: List[float],
        total_execution_time: float,
        total_token_count: int,
        success: bool
    ) -> ChainUsageAnalytics:
        """Record usage analytics for a prompt chain."""
        analytics = ChainUsageAnalytics(
            chain_id=chain_id,
            user_id=user_id,
            agent_id=agent_id,
            session_id=session_id,
            model=model,
            parameters=parameters,
            input_variables=input_variables,
            step_execution_times=step_execution_times,
            total_execution_time=total_execution_time,
            total_token_count=total_token_count,
            success=success
        )
        
        db.add(analytics)
        db.commit()
        db.refresh(analytics)
        return analytics
    
    @staticmethod
    async def get_template_analytics(
        db: Session,
        template_id: int,
        user_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get analytics for a prompt template."""
        # Check if user has access to template
        template = await PromptTemplateService.get_template(db, template_id, user_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found or you don't have permission")
        
        # Get analytics data
        from datetime import datetime, timedelta
        from sqlalchemy import func
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Get usage count
        usage_count = db.query(func.count(PromptUsageAnalytics.id)).filter(
            PromptUsageAnalytics.template_id == template_id,
            PromptUsageAnalytics.created_at >= start_date
        ).scalar()
        
        # Get success rate
        success_count = db.query(func.count(PromptUsageAnalytics.id)).filter(
            PromptUsageAnalytics.template_id == template_id,
            PromptUsageAnalytics.created_at >= start_date,
            PromptUsageAnalytics.success == True
        ).scalar()
        
        success_rate = (success_count / usage_count) * 100 if usage_count > 0 else 0
        
        # Get average execution time
        avg_time = db.query(func.avg(PromptUsageAnalytics.execution_time)).filter(
            PromptUsageAnalytics.template_id == template_id,
            PromptUsageAnalytics.created_at >= start_date
        ).scalar() or 0
        
        # Get average token count
        avg_tokens = db.query(func.avg(PromptUsageAnalytics.token_count)).filter(
            PromptUsageAnalytics.template_id == template_id,
            PromptUsageAnalytics.created_at >= start_date
        ).scalar() or 0
        
        # Get most used model
        model_counts = db.query(
            PromptUsageAnalytics.model,
            func.count(PromptUsageAnalytics.id).label('count')
        ).filter(
            PromptUsageAnalytics.template_id == template_id,
            PromptUsageAnalytics.created_at >= start_date
        ).group_by(PromptUsageAnalytics.model).order_by(func.count(PromptUsageAnalytics.id).desc()).first()
        
        most_used_model = model_counts[0] if model_counts else None
        
        # Get usage by day
        usage_by_day = db.query(
            func.date(PromptUsageAnalytics.created_at).label('date'),
            func.count(PromptUsageAnalytics.id).label('count')
        ).filter(
            PromptUsageAnalytics.template_id == template_id,
            PromptUsageAnalytics.created_at >= start_date
        ).group_by(func.date(PromptUsageAnalytics.created_at)).all()
        
        usage_by_day_dict = {str(day[0]): day[1] for day in usage_by_day}
        
        return {
            "template_id": template_id,
            "template_title": template.title,
            "usage_count": usage_count,
            "success_rate": success_rate,
            "avg_execution_time": avg_time,
            "avg_token_count": avg_tokens,
            "most_used_model": most_used_model,
            "usage_by_day": usage_by_day_dict
        }
    
    @staticmethod
    async def get_chain_analytics(
        db: Session,
        chain_id: int,
        user_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get analytics for a prompt chain."""
        # Check if user has access to chain
        chain = await PromptChainService.get_chain(db, chain_id, user_id)
        if not chain:
            raise HTTPException(status_code=404, detail="Chain not found or you don't have permission")
        
        # Get analytics data
        from datetime import datetime, timedelta
        from sqlalchemy import func
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Get usage count
        usage_count = db.query(func.count(ChainUsageAnalytics.id)).filter(
            ChainUsageAnalytics.chain_id == chain_id,
            ChainUsageAnalytics.created_at >= start_date
        ).scalar()
        
        # Get success rate
        success_count = db.query(func.count(ChainUsageAnalytics.id)).filter(
            ChainUsageAnalytics.chain_id == chain_id,
            ChainUsageAnalytics.created_at >= start_date,
            ChainUsageAnalytics.success == True
        ).scalar()
        
        success_rate = (success_count / usage_count) * 100 if usage_count > 0 else 0
        
        # Get average execution time
        avg_time = db.query(func.avg(ChainUsageAnalytics.total_execution_time)).filter(
            ChainUsageAnalytics.chain_id == chain_id,
            ChainUsageAnalytics.created_at >= start_date
        ).scalar() or 0
        
        # Get average token count
        avg_tokens = db.query(func.avg(ChainUsageAnalytics.total_token_count)).filter(
            ChainUsageAnalytics.chain_id == chain_id,
            ChainUsageAnalytics.created_at >= start_date
        ).scalar() or 0
        
        # Get most used model
        model_counts = db.query(
            ChainUsageAnalytics.model,
            func.count(ChainUsageAnalytics.id).label('count')
        ).filter(
            ChainUsageAnalytics.chain_id == chain_id,
            ChainUsageAnalytics.created_at >= start_date
        ).group_by(ChainUsageAnalytics.model).order_by(func.count(ChainUsageAnalytics.id).desc()).first()
        
        most_used_model = model_counts[0] if model_counts else None
        
        # Get usage by day
        usage_by_day = db.query(
            func.date(ChainUsageAnalytics.created_at).label('date'),
            func.count(ChainUsageAnalytics.id).label('count')
        ).filter(
            ChainUsageAnalytics.chain_id == chain_id,
            ChainUsageAnalytics.created_at >= start_date
        ).group_by(func.date(ChainUsageAnalytics.created_at)).all()
        
        usage_by_day_dict = {str(day[0]): day[1] for day in usage_by_day}
        
        return {
            "chain_id": chain_id,
            "chain_title": chain.title,
            "usage_count": usage_count,
            "success_rate": success_rate,
            "avg_execution_time": avg_time,
            "avg_token_count": avg_tokens,
            "most_used_model": most_used_model,
            "usage_by_day": usage_by_day_dict
        }
    
    @staticmethod
    async def get_optimization_suggestions(
        db: Session,
        template_id: int,
        user_id: int
    ) -> List[Dict[str, str]]:
        """Get optimization suggestions for a prompt template."""
        # Check if user has access to template
        template = await PromptTemplateService.get_template(db, template_id, user_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found or you don't have permission")
        
        # Get test results
        test_results = db.query(PromptTestResult).filter(
            PromptTestResult.template_id == template_id,
            PromptTestResult.rating.isnot(None)  # Only consider rated results
        ).order_by(PromptTestResult.created_at.desc()).limit(20).all()
        
        if not test_results:
            return [{"type": "info", "message": "Not enough test data to generate suggestions."}]
        
        suggestions = []
        
        # Check for high token usage
        avg_tokens = sum(result.prompt_text.count(' ') for result in test_results) / len(test_results)
        if avg_tokens > 500:
            suggestions.append({
                "type": "warning",
                "message": "Prompt is quite long, consider making it more concise to reduce token usage."
            })
        
        # Check for low ratings
        avg_rating = sum(result.rating or 0 for result in test_results) / len(test_results)
        if avg_rating < 3:
            suggestions.append({
                "type": "warning",
                "message": "This prompt has low average ratings. Consider revising its structure or clarity."
            })
        
        # Check for variable usage
        if template.variables and len(template.variables) > 0:
            missing_defaults = [var["name"] for var in template.variables if var["name"] not in template.default_values]
            if missing_defaults:
                suggestions.append({
                    "type": "tip",
                    "message": f"Consider adding default values for variables: {', '.join(missing_defaults)}"
                })
        
        # Check for execution time
        avg_time = sum(result.execution_time for result in test_results) / len(test_results)
        if avg_time > 5.0:
            suggestions.append({
                "type": "tip",
                "message": "Responses are taking longer than average. Consider simplifying the prompt or breaking it into smaller steps."
            })
        
        # Add general suggestions if we don't have many specific ones
        if len(suggestions) < 2:
            suggestions.append({
                "type": "tip",
                "message": "Use clear, specific instructions at the beginning of your prompt."
            })
            suggestions.append({
                "type": "tip",
                "message": "Consider using numbered lists for multi-step instructions."
            })
            
        return suggestions


class PromptLibraryService:
    """Service for managing the community prompt library."""
    
    @staticmethod
    async def publish_to_library(
        db: Session,
        user_id: int,
        title: str,
        description: str,
        template_id: Optional[int] = None,
        chain_id: Optional[int] = None
    ) -> PromptLibraryItem:
        """Publish a template or chain to the community library."""
        if template_id is None and chain_id is None:
            raise HTTPException(status_code=400, detail="Must provide either template_id or chain_id")
            
        if template_id is not None and chain_id is not None:
            raise HTTPException(status_code=400, detail="Cannot provide both template_id and chain_id")
            
        # Check if user has access to the item
        if template_id:
            item = await PromptTemplateService.get_template(db, template_id, user_id)
            if not item:
                raise HTTPException(status_code=404, detail="Template not found or you don't have permission")
            item_type = "template"
        else:
            item = await PromptChainService.get_chain(db, chain_id, user_id)
            if not item:
                raise HTTPException(status_code=404, detail="Chain not found or you don't have permission")
            item_type = "chain"
            
        # Create library item
        library_item = PromptLibraryItem(
            template_id=template_id,
            chain_id=chain_id,
            title=title,
            description=description,
            item_type=item_type,
            creator_id=user_id
        )
        
        db.add(library_item)
        db.commit()
        db.refresh(library_item)
        return library_item
    
    @staticmethod
    async def get_library_items(
        db: Session,
        item_type: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: str = "rating",
        limit: int = 20,
        offset: int = 0
    ) -> List[PromptLibraryItem]:
        """Get items from the community library."""
        query = db.query(PromptLibraryItem)
        
        # Filter by type
        if item_type:
            query = query.filter(PromptLibraryItem.item_type == item_type)
            
        # Search
        if search_query:
            query = query.filter(
                (PromptLibraryItem.title.ilike(f"%{search_query}%")) |
                (PromptLibraryItem.description.ilike(f"%{search_query}%"))
            )
            
        # Sort
        if sort_by == "rating":
            # Calculate average rating
            query = query.order_by(
                (PromptLibraryItem.rating_sum / PromptLibraryItem.rating_count).desc().nullslast(),
                PromptLibraryItem.download_count.desc()
            )
        elif sort_by == "downloads":
            query = query.order_by(PromptLibraryItem.download_count.desc())
        elif sort_by == "newest":
            query = query.order_by(PromptLibraryItem.created_at.desc())
        else:
            # Default to rating
            query = query.order_by(
                (PromptLibraryItem.rating_sum / PromptLibraryItem.rating_count).desc().nullslast(),
                PromptLibraryItem.download_count.desc()
            )
            
        # Pagination
        query = query.offset(offset).limit(limit)
        
        return query.all()
    
    @staticmethod
    async def get_library_item(
        db: Session,
        item_id: int
    ) -> Optional[PromptLibraryItem]:
        """Get a specific item from the community library."""
        return db.query(PromptLibraryItem).filter(PromptLibraryItem.id == item_id).first()
    
    @staticmethod
    async def download_library_item(
        db: Session,
        item_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Download an item from the community library."""
        library_item = await PromptLibraryService.get_library_item(db, item_id)
        if not library_item:
            raise HTTPException(status_code=404, detail="Library item not found")
            
        # Increment download count
        library_item.download_count += 1
        db.commit()
        
        # Get the actual template or chain
        if library_item.item_type == "template":
            template = await PromptTemplateService.get_template(db, library_item.template_id, user_id)
            if not template:
                raise HTTPException(status_code=404, detail="Template not found")
                
            # Create a copy for the user
            new_template = await PromptTemplateService.create_template(
                db=db,
                title=f"{template.title} (from Library)",
                template_text=template.template_text,
                creator_id=user_id,
                description=template.description,
                variables=template.variables,
                default_values=template.default_values,
                is_public=False
            )
            
            return {
                "item_type": "template",
                "item_id": new_template.id,
                "title": new_template.title,
                "message": "Template has been added to your collection."
            }
            
        else:  # chain
            chain = await PromptChainService.get_chain(db, library_item.chain_id, user_id)
            if not chain:
                raise HTTPException(status_code=404, detail="Chain not found")
                
            # Get template IDs in order
            templates_query = """
                SELECT pt.id, pct.order_index FROM prompt_templates pt
                JOIN prompt_chain_templates pct ON pt.id = pct.prompt_template_id
                WHERE pct.prompt_chain_id = :chain_id
                ORDER BY pct.order_index
            """
            template_rows = db.execute(templates_query, {"chain_id": chain.id}).fetchall()
            template_ids = [row[0] for row in template_rows]
            
            # Create copies of all templates
            new_template_ids = []
            for template_id in template_ids:
                template = await PromptTemplateService.get_template(db, template_id, user_id)
                if template:
                    new_template = await PromptTemplateService.create_template(
                        db=db,
                        title=f"{template.title} (from Library)",
                        template_text=template.template_text,
                        creator_id=user_id,
                        description=template.description,
                        variables=template.variables,
                        default_values=template.default_values,
                        is_public=False
                    )
                    new_template_ids.append(new_template.id)
            
            # Create a copy of the chain
            new_chain = await PromptChainService.create_chain(
                db=db,
                title=f"{chain.title} (from Library)",
                creator_id=user_id,
                description=chain.description,
                template_ids=new_template_ids,
                is_public=False
            )
            
            return {
                "item_type": "chain",
                "item_id": new_chain.id,
                "title": new_chain.title,
                "message": "Chain has been added to your collection."
            }
    
    @staticmethod
    async def review_library_item(
        db: Session,
        item_id: int,
        user_id: int,
        rating: int,
        review_text: Optional[str] = None
    ) -> PromptLibraryReview:
        """Review an item in the community library."""
        library_item = await PromptLibraryService.get_library_item(db, item_id)
        if not library_item:
            raise HTTPException(status_code=404, detail="Library item not found")
            
        # Check if user has already reviewed this item
        existing_review = db.query(PromptLibraryReview).filter(
            PromptLibraryReview.library_item_id == item_id,
            PromptLibraryReview.user_id == user_id
        ).first()
        
        if existing_review:
            # Update existing review
            old_rating = existing_review.rating
            existing_review.rating = rating
            existing_review.review_text = review_text
            
            # Update library item rating
            library_item.rating_sum = library_item.rating_sum - old_rating + rating
            
            db.commit()
            db.refresh(existing_review)
            return existing_review
        else:
            # Create new review
            review = PromptLibraryReview(
                library_item_id=item_id,
                user_id=user_id,
                rating=rating,
                review_text=review_text
            )
            
            db.add(review)
            
            # Update library item rating
            library_item.rating_sum += rating
            library_item.rating_count += 1
            
            db.commit()
            db.refresh(review)
            return review
