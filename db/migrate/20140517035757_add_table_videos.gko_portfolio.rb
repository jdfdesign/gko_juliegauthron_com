# This migration comes from gko_portfolio (originally 20140517054800)
class AddTableVideos < ActiveRecord::Migration
  def change
    create_table :videos, :force => true do |t|
      t.string :title
      t.string :address, :limit => 50
      t.references :content
      t.string :image_mime_type
      t.string :image_name
      t.integer :image_size
      t.integer :image_width
      t.integer :image_height
      t.string :image_uid
      t.string :image_ext
      t.timestamps
    end
  end
end