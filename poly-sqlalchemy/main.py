from sqlalchemy import String, create_engine, text, cast, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, column_property, relationship, foreign, remote
from sqlalchemy.dialects.sqlite import JSON
import factory
import factory.fuzzy
from pprint import pprint


##

engine = create_engine('sqlite:///poly.db')
session = sessionmaker(engine)()

##

session.execute(
    text("DROP TABLE IF EXISTS entities;"
))
session.execute(
    text("CREATE TABLE entities (id INTEGER PRIMARY KEY AUTOINCREMENT, eid CHAR, type CHAR, sub_type CHAR, data JSON NOT NULL);"
))

session.commit()

##

class Base(DeclarativeBase):
    pass

class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[int] = mapped_column(primary_key=True)
    eid: Mapped[str] = mapped_column(String(30))
    type: Mapped[str] = mapped_column(String(30))
    sub_type: Mapped[str] = mapped_column(String(30))
    data: Mapped[str] = mapped_column(JSON)

    key = column_property(type + "-" + sub_type)
    __mapper_args__ = {
        "polymorphic_on": key,
        'with_polymorphic': '*'
    }

    def __repr__(self) -> str:
        return f"Entity(id={self.id}, eid={self.eid}, type={self.type}, sub_type={self.sub_type}, data={self.data})"

##

class GoogleCampaign(Entity):
    __mapper_args__ = {
        "polymorphic_identity": "google-campaign",
    }

    other_thing = "HI"

    @property
    def test():
        return "oi"
    
    def __repr__(self) -> str:
        return f"GoogleCampaign(id={self.id}, eid={self.eid}, type={self.type}, sub_type={self.sub_type}, data={self.data})"


class GoogleAdgroup(Entity):
    __mapper_args__ = {
        "polymorphic_identity": "google-ad_group",
    }

    # this does not work, but should
    # campaign_eid = column_property(Entity.data.op('->>')('parent_id'))

    # the replace is because sqlite uses json_quote
    campaign_eid = column_property(func.REPLACE(Entity.data['parent_id'], '"', ''))

    campaign: Mapped[GoogleCampaign] = relationship(
        backref="adgroups",
        foreign_keys=[campaign_eid],
        primaryjoin=remote(GoogleCampaign.eid)==foreign(campaign_eid)
    )
    
    def __repr__(self) -> str:
        return f"GoogleAdgroup(id={self.id}, eid={self.eid}, type={self.type}, sub_type={self.sub_type}, data={self.data}, campaign_eid={self.campaign_eid})"


class GoogleAd(Entity):
    __mapper_args__ = {
        "polymorphic_identity": "google-ad",
    }

    # this does not work, but should
    # adgroup_eid = column_property(Entity.data.op('->>')('parent_id'))

    # the replace is because sqlite uses json_quote
    adgroup_eid = column_property(func.REPLACE(Entity.data['parent_id'], '"', ''))

    adgroup: Mapped[GoogleAdgroup] = relationship(
        backref="ads",
        foreign_keys=[adgroup_eid],
        primaryjoin=remote(GoogleAdgroup.eid)==foreign(adgroup_eid)
    )
    
    def __repr__(self) -> str:
        return f"GoogleAd(id={self.id}, eid={self.eid}, type={self.type}, sub_type={self.sub_type}, data={self.data}, adgroup_eid={self.adgroup_eid})"

##

class PinterestCampaign(Entity):
    __mapper_args__ = {
        "polymorphic_identity": "pinterest-campaign",
    }

##

class TikTokCampaign(Entity):
    __mapper_args__ = {
        "polymorphic_identity": "tiktok-campaign",
    }

##

class EntityFactory(factory.Factory):
    class Meta:
        model = Entity

    class Params:
        parent = None

    eid = factory.Faker("bothify", text="???????????")
    type = factory.fuzzy.FuzzyChoice(['google', 'pinterest', 'tiktok'])
    sub_type = factory.fuzzy.FuzzyChoice(['campaign', 'ad_group', 'ad'])
    data = factory.Dict({"parent_id": factory.LazyAttribute(lambda x: x.factory_parent.parent.eid if x.factory_parent.parent else None)})

##

class GoogleEntityFactory(EntityFactory):
    type = 'google'

class GoogleCampaignFactory(GoogleEntityFactory):
    class Meta:
        model = GoogleCampaign

    sub_type = 'campaign'

class GoogleAdgroupFactory(GoogleEntityFactory):
    class Meta:
        model = GoogleAdgroup

    sub_type = 'ad_group'

class GoogleAdFactory(GoogleEntityFactory):
    class Meta:
        model = GoogleAd

    sub_type = 'ad'

##

google_one = GoogleCampaignFactory()
google_two = GoogleAdgroupFactory(parent=google_one)
google_three = GoogleAdgroupFactory(parent=google_one)
google_four = GoogleAdFactory(parent=google_three)

pinterest_one = EntityFactory(type='pinterest', sub_type='campaign')
tiktok_one = EntityFactory(type='tiktok', sub_type='campaign')

session.add_all([google_one, google_two, google_three, google_four, pinterest_one, tiktok_one])

session.commit()

assert session.query(Entity).count() == 6
assert session.query(GoogleCampaign).count() == 1
assert session.query(GoogleAdgroup).count() == 2
assert session.query(GoogleAd).count() == 1

adg = session.query(GoogleAdgroup).filter(GoogleAdgroup.eid==google_three.eid).first()

assert adg.campaign
assert adg in adg.campaign.adgroups
assert adg.ads
assert adg.ads[0].adgroup == adg

ad = session.query(GoogleAd).filter(GoogleAd.eid==google_four.eid).first()
assert ad.adgroup == adg

##

another_one = EntityFactory(type='google', sub_type='campaign')
session.add(another_one)
session.commit()
assert another_one.__class__ == Entity # Why this does not work? should be GoogleCampaign already
another_one = session.query(GoogleCampaign).filter(GoogleCampaign.eid==another_one.eid).first()
assert another_one.__class__ == Entity # Why this does not work? should be GoogleCampaign at least in here

another_session = sessionmaker(engine)()
another_one = another_session.query(GoogleCampaign).filter(GoogleCampaign.eid==another_one.eid).first()

assert another_one.__class__ == GoogleCampaign

##

other_google_one = another_session.query(GoogleCampaign).filter(GoogleCampaign.eid==google_one.eid).first()
