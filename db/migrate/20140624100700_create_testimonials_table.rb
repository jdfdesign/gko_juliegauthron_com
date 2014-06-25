# This migration comes from gko_testimonials(originally 20140624100700)
class CreateTestimonialsTable < ActiveRecord::Migration
  def up
    create_table "testimonial_translations", :force => true do |t|
      t.integer  "testimonial_id"
      t.string   "locale"
      t.string   "title"
      t.text     "body"
      t.string   "meta_description"
      t.string   "slug"
      t.string   "meta_title"
      t.string   "excerpt"
      t.datetime "created_at",       :null => false
      t.datetime "updated_at",       :null => false
    end

    add_index "testimonial_translations", ["locale"], :name => "index_testimonial_translations_on_locale"
    add_index "testimonial_translations", ["testimonial_id"], :name => "index_testimonial_translations_on_testimonial_id"

    create_table "testimonials", :force => true do |t|
      t.integer  "section_id",       :null => false
      t.integer  "site_id",          :null => false
      t.text     "body"
      t.string   "title"
      t.string   "meta_title"
      t.string   "meta_description"
      t.string   "slug"
      t.string   "name"
      t.string   "excerpt"
      t.string   "author"
      t.string   "company"
      t.string   "content_type"
      t.integer  "width"
      t.integer  "height"
      t.integer  "size"
      t.string  "source"
      t.string  "source_filename"
      t.datetime "published_at"
      t.datetime "created_at",       :null => false
      t.datetime "updated_at",       :null => false
    end

    add_index "testimonials", ["section_id"], :name => "index_testimonials_on_section"
    add_index "testimonials", ["site_id"], :name => "index_testimonials_on_site"

  end
end