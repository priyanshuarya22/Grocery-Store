from flask_restful import Resource
from ..decorators import roles_required
from ..models import Section, RequestedSection
from .. import db, cache
from flask import request


class SectionsAPI(Resource):
    @cache.cached(timeout=10)
    def get(self):
        sections = Section.query.all()
        result = []
        for section in sections:
            section_dict = dict(section.__dict__)
            section_dict.pop('_sa_instance_state', None)
            result.append(section_dict)
        return result


class SectionAPI(Resource):
    @cache.cached(timeout=10)
    def get(self, name):
        section = Section.query.filter_by(name=name).first()
        if section:
            section_dict = dict(section.__dict__)
            section_dict.pop('_sa_instance_state', None)
            return section_dict
        return {'error': 'Section not Found!'}

    @roles_required('admin')
    def put(self, name):
        section = Section.query.filter_by(name=name).first()
        if not section:
            return {'error': 'Section not Found!'}
        section.name = request.json.get('name', None)
        section.description = request.json.get('description', None)
        db.session.commit()
        return {'message': 'Section updated successfully!'}

    @roles_required('admin')
    def post(self):
        name = request.json.get('name', None)
        description = request.json.get('description', None)
        section = Section.query.filter_by(name=name).first()
        if section:
            return {'error': 'Section already exists!'}
        section = Section(name=name, description=description)
        db.session.add(section)
        db.session.commit()
        return {'message': 'Section added successfully!'}

    @roles_required('admin')
    def delete(self, name):
        section = Section.query.filter_by(name=name).first()
        if not section:
            return {'error': 'Section not found!'}
        db.session.delete(section)
        db.session.commit()
        return {'message': 'Section deleted successfully!'}


class RequestSection(Resource):
    @roles_required('manager')
    def put(self, name):
        section = Section.query.filter_by(name=name).first()
        if not section:
            return {'error': 'Section not found!'}
        name = request.json.get('name', None)
        description = request.json.get('description', None)
        request_section = RequestedSection(name=name, description=description, parent_section=section.id)
        db.session.add(request_section)
        db.session.commit()
        return {'message': 'Section Requested successfully!'}

    @roles_required('manager')
    def post(self):
        name = request.json.get('name', None)
        description = request.json.get('description', None)
        section = Section.query.filter_by(name=name).first()
        if section:
            return {'error': 'Section already exists!'}
        request_section = RequestedSection(name=name, description=description)
        db.session.add(request_section)
        db.session.commit()
        return {'message': 'Section Requested successfully!'}

    @roles_required('manager')
    def delete(self, name):
        section = Section.query.filter_by(name=name).first()
        if not section:
            return {'error': 'Section not found!'}
        request_section = RequestedSection(name=name, deletion=True)
        db.session.add(request_section)
        db.session.commit()
        return {'message': 'Section deletion requested successfully!'}

class HandleRequestedSection(Resource):
    @roles_required('admin', 'manager')
    def get(self):
        sections = RequestedSection.query.all()
        result = []
        for section in sections:
            section_dict = dict(section.__dict__)
            section_dict.pop('_sa_instance_state', None)
            if section.parent_section:
                old_section = Section.query.filter_by(id=section.parent_section).first()
                old_section_dict = dict(old_section.__dict__)
                old_section_dict.pop('_sa_instance_state', None)
                section_dict.update({f'old_{k}': v for k, v in old_section_dict})
            result.append(section_dict)
        return result

    @roles_required('admin')
    def post(self, name):
        requested_section = RequestedSection.query.filter_by(name=name).first()
        if not requested_section:
            return {'error': 'Section not found!'}
        if requested_section.deletion:
            section = Section.query.filter_by(name=name).first()
            if not section:
                return {'error': 'Section not found!'}
            db.session.delete(section)
            db.session.delete(requested_section)
            db.session.commit()
            return {'message': 'Section deleted successfully!'}
        if requested_section.parent_section:
            section = Section.query.filter_by(id=requested_section.parent_section).first()
            if not section:
                return {'error': 'Section not found!'}
            section.name = requested_section.name
            section.description = requested_section.description
            db.session.delete(requested_section)
            db.session.commit()
            return {'message': 'Section successfully updated!'}
        section = Section(name=name, description=requested_section.description)
        db.session.add(section)
        db.session.delete(requested_section)
        db.session.commit()
        return {'message': 'Section successfully created!'}

    @roles_required('admin')
    def delete(self, name):
        section = RequestedSection.query.filter_by(name=name).first()
        if not section:
            return {'error': 'Section not found!'}
        db.session.delete(section)
        db.session.commit()
        return {'message': 'Request successfully dismissed!'}
